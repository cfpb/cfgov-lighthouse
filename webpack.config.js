const fs = require( 'fs' );
const path = require( 'path' );

const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const NunjucksWebpackPlugin = require( 'nunjucks-webpack-plugin' );


/**
 * Create plugin to generate HTML files using Nunjucks templates. Plugin will
 * generate a Lighthouse summary HTML file for each subdirectory under
 * ./docs/reports, plus a index.html that links to each of those summary files.
 *
 * @returns {NunjucksWebpackPlugin} Webpack plugin to create HTML files.
 */
function buildReportPlugin() {
  const BASE_PATH = './docs/reports';

  // eslint-disable-next-line no-sync
  const subdirs = fs
    .readdirSync( BASE_PATH, { withFileTypes: true } )
    .filter( dirent => dirent.isDirectory() )
    .map( dirent => dirent.name );

  return new NunjucksWebpackPlugin(
    {
      templates: [
        {
          from: './src/index.njk',
          to: 'index.html',
          context: {
            manifests: subdirs
          }
        },
        ...subdirs.map( subdir => {
          const manifestFilename = `${ BASE_PATH }/${ subdir }/manifest.json`;

          // eslint-disable-next-line no-sync
          const manifest = JSON.parse( fs.readFileSync( manifestFilename ) );

          return {
            from: './src/manifest.njk',
            to: `reports/${ subdir }/index.html`,
            context: {
              subdir: subdir,
              manifest: manifest
            }
          };
        } )
      ]
    }
  );
}


module.exports = ( env, argv ) => {

  const config = {
    mode: argv.mode || 'development',
    entry: {
      main: [ './src/js/main.js', './src/css/main.less' ]
    },
    output: {
      path: path.resolve( __dirname, 'docs' ),
      filename: 'static/js/main.js'
    },
    plugins: [
      new MiniCssExtractPlugin(
        {
          filename: 'static/css/[name].css'
        }
      ),
      buildReportPlugin()
    ],
    module: {
      rules: [
        {
          test: /\.less$/,
          exclude: /node_modules/,
          use: [ MiniCssExtractPlugin.loader, 'css-loader', 'less-loader' ]
        },
        {
          test: /\.js$/,
          exclude: [
            path.resolve( __dirname, 'node_modules' )
          ],
          use: [ 'babel-loader' ]
        }
      ]
    }
  };

  return config;
};
