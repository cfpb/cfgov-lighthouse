const fs = require("fs");
const nunjucks = require("nunjucks");
const nunjucksDateFilter = require("nunjucks-date-filter");
const path = require("path");
const filters = require("./scripts/lib/filters");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const NunjucksWebpackPlugin = require("nunjucks-webpack-plugin");

// eslint-disable-next-line no-process-env
const RELATIVE_URL = process.env.LIGHTHOUSE_RELATIVE_URL || "";

// eslint-disable-next-line no-sync
const allReports = JSON.parse(
  fs.readFileSync(path.resolve("docs/reports.json"))
);

const nunjucksEnvironment = nunjucks.configure();
nunjucksEnvironment.addFilter("date", nunjucksDateFilter);

nunjucksEnvironment.addFilter("scoreIcon", filters.scoreIcon);

/**
 * Get a list of all the pages and their report data for Webpack to templatize.
 * @param {object} reports - Lighthouse reports organized by cf.gov page slug and date.
 * @returns {Array} List of templates to pass to nunjucks webpack plugin.
 */
function getPageTemplates(reports) {
  const templates = [];
  for (const [slug, summary] of Object.entries(reports)) {
    templates.push({
      from: "./src/templates/page.njk",
      to: `${slug}/index.html`,
      context: {
        RELATIVE_URL,
        url: summary[Object.keys(summary)[0]].url,
        summaryReport: summary,
      },
    });
  }
  return templates;
}

/**
 * Create plugin to generate HTML files using Nunjucks templates. Plugin will
 * generate a Lighthouse summary HTML file for each subdirectory under
 * ./docs/reports, plus an index.html that links to each of those summary files.
 * Filter out pages that aren't in the most recent result set.
 * @param {object} reports - All the Lighthouse reports read from reports.json.
 * @returns {NunjucksWebpackPlugin} Webpack plugin to create HTML files.
 */
function buildReportPlugin(reports) {
  const latestReportDates = Object.keys(reports).map((key) =>
      reports[key]
        ? Object.keys(reports[key]).sort()[Object.keys(reports[key]).length - 1]
        : []
    ),
    latestReportDate = latestReportDates
      ? latestReportDates.sort()[latestReportDates.length - 1]
      : null,
    latestReports = Object.keys(reports)
      .filter((key) => latestReportDate in reports[key])
      .reduce((obj, key) => {
        return {
          ...obj,
          [key]: reports[key],
        };
      }, {});

  return new NunjucksWebpackPlugin({
    templates: [
      {
        from: "./src/templates/index.njk",
        to: "index.html",
        context: {
          RELATIVE_URL,
          pages: latestReports,
        },
      },
      ...getPageTemplates(latestReports),
    ],
    configure: nunjucksEnvironment,
  });
}

module.exports = (env, argv) => {
  const config = {
    mode: argv.mode || "development",
    entry: {
      main: ["./src/css/main.scss", "./src/js/main.js"],
    },
    output: {
      path: path.resolve(__dirname, "docs"),
      filename: "static/js/[name].js",
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "static/css/[name].css",
      }),
      buildReportPlugin(allReports.pages),
    ],
    module: {
      rules: [
        {
          test: /\.scss$/,
          exclude: /node_modules/,
          use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
        },
        {
          test: /\.js$/,
          exclude: [path.resolve(__dirname, "node_modules")],
          use: ["babel-loader"],
        },
      ],
    },
  };

  return config;
};
