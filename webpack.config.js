const fs = require( 'fs' );
const nunjucks = require( 'nunjucks' );
const nunjucksDateFilter = require( 'nunjucks-date-filter' );
const path = require( 'path' );
const filters = require( './scripts/lib/filters' );

const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const NunjucksWebpackPlugin = require( 'nunjucks-webpack-plugin' );

// eslint-disable-next-line no-process-env
const RELATIVE_URL = process.env.LIGHTHOUSE_RELATIVE_URL || '';

// eslint-disable-next-line no-sync
const allReports = JSON.parse( fs.readFileSync( path.resolve( 'docs/reports.json' ) ) );

const nunjucksEnvironment = nunjucks.configure();
nunjucksEnvironment.addFilter( 'date', nunjucksDateFilter );

nunjucksEnvironment.addFilter( 'scoreIcon', filters.scoreIcon );

/**
 * Get a list of all the pages and their report data for Webpack to templatize.
 * @param {Object} reports Lighthouse reports organized by cf.gov page slug and date.
 * @returns {Array} List of templates to pass to nunjucks webpack plugin.
 */
function getPageTemplates( reports ) {
  const templates = [];
  for ( const [ slug, summary ] of Object.entries( reports.pages ) ) {
    templates.push( {
      from: './src/templates/page.njk',
      to: `${ slug }/index.html`,
      context: {
        RELATIVE_URL,
        url: summary[Object.keys( summary )[0]].url,
        summaryReport: summary
      }
    } );
  }
  return templates;
}

/**
 * Create plugin to generate HTML files using Nunjucks templates. Plugin will
 * generate a Lighthouse summary HTML file for each subdirectory under
 * ./docs/reports, plus an index.html that links to each of those summary files.
 * @param {Object} reports All the Lighthouse reports read from reports.json.
 * @returns {NunjucksWebpackPlugin} Webpack plugin to create HTML files.
 */
function buildReportPlugin( reports ) {
  return new NunjucksWebpackPlugin(
    {
      templates: [
        {
          from: './src/templates/index.njk',
          to: 'index.html',
          context: {
            RELATIVE_URL,
            pages: allReports.pages
          }
        },
        ...getPageTemplates( reports )
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
      buildReportPlugin( allReports )
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
