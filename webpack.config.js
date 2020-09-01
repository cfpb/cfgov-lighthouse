const fs = require( 'fs' );
const path = require( 'path' );

const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const NunjucksWebpackPlugin = require( 'nunjucks-webpack-plugin' );

const {
  LighthouseSummaryReport,
  REPORTS_ROOT
} = require( './src/lighthouse/reports' );


/**
 * Create plugin to generate HTML files using Nunjucks templates. Plugin will
 * generate a Lighthouse summary HTML file for each subdirectory under
 * ./docs/reports, plus an index.html that links to each of those summary files.
 *
 * @returns {NunjucksWebpackPlugin} Webpack plugin to create HTML files.
 */
function buildReportPlugin() {
  // eslint-disable-next-line no-sync
  const timestamps = fs
    .readdirSync( REPORTS_ROOT, { withFileTypes: true } )
    .filter( dirent => dirent.isDirectory() )
    .map( dirent => dirent.name );

  return new NunjucksWebpackPlugin(
    {
      templates: [
        {
          from: './src/templates/index.njk',
          to: 'index.html',
          context: {
            timestamps: timestamps
          }
        },
        ...timestamps.map( timestamp => {
          const summaryReport = new LighthouseSummaryReport( timestamp );

          return {
            from: './src/templates/summary_report.njk',
            to: path.join( REPORTS_ROOT, timestamp, 'index.html' ),
            context: {
              summaryReport: summaryReport
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
      main: [ './src/css/main.less' ],
      report: [ './src/js/report.js' ]
    },
    output: {
      path: path.resolve( __dirname, 'docs' ),
      filename: 'static/js/[name].js'
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
