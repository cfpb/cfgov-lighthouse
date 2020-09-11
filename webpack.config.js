const fs = require( 'fs' );
const nunjucks = require( 'nunjucks' );
const nunjucksDateFilter = require( 'nunjucks-date-filter' );
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
    .map( dirent => dirent.name )
    .sort();

  const latestTimestamp = timestamps[timestamps.length - 1];

  const summaryReport = new LighthouseSummaryReport( latestTimestamp );

  const nunjucksEnvironment = nunjucks.configure();
  nunjucksEnvironment.addFilter( 'date', nunjucksDateFilter );

  return new NunjucksWebpackPlugin(
    {
      templates: [
        {
          from: './src/templates/index.njk',
          to: 'index.html',
          context: {
            summaryReport: summaryReport
          }
        }
      ],
      configure: nunjucksEnvironment
    }
  );
}


module.exports = ( env, argv ) => {

  const config = {
    mode: argv.mode || 'development',
    entry: {
      main: [ './src/css/main.less', './src/js/main.js' ]
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
