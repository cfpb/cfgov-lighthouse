const path = require( 'path' );
const { promises: fs } = require( 'fs' );

// Location where the reports are stored, organized by timestamp
const REPORTS_ROOT = path.resolve( __dirname, '../../docs/reports' );

/**
 * Get list of Lighthouse report manifest locations.
 * @param {String} reportsDir Location of lighthouse reports directory.
 * @returns {Array} List of manifest locations.
 */
async function getManifests( reportsDir ) {
  const reportDirs = await fs.readdir( reportsDir, { withFileTypes: true } );
  const manifests = reportDirs.filter( reportDir => reportDir.isDirectory() )
    .map( reportDir => `${ reportsDir }/${ reportDir.name }/manifest.json` )
    .sort();
  return manifests;
}

/**
 * Read manifest file.
 * @param {String} manifestLocation Location of Lighthouse manifest file.
 * @returns {Object} {returnawaitJSON.parse(fs.readFile(manifestFilename
 */
async function readManifest( manifestLocation ) {
  const manifest = await fs.readFile( manifestLocation );
  return JSON.parse( manifest );
}

/**
 * Get a list of a manifest's representative runs and its non-representative runs.
 * @param {Object} manifest Contents of a Lighthouse manifest file.
 * @returns {Object} Two separate run arrays.
 */
function getManifestRuns( manifest ) {
  const runs = {
    repRuns: [],
    nonRepRuns: []
  };
  const reducer = ( prevRuns, run ) => ( {
    repRuns: run.isRepresentativeRun ? [ ...prevRuns.repRuns, run ] : [ ...prevRuns.repRuns ],
    nonRepRuns: run.isRepresentativeRun ? [ ...prevRuns.nonRepRuns ] : [ ...prevRuns.nonRepRuns, run ]
  } );
  return manifest.reduce( reducer, runs );
}

/**
 * Get the local location of a run's JSON. The manifest files store
 * their locations relative to GitHub Action's filesystem.
 * @param {String} jsonPath Lighthouse run's JSON path from its manifest file.
 * @returns {String} Local location of run's JSON.
 */
function getRunLocation( jsonPath ) {
  const fileName = path.basename( jsonPath );
  const fileDir = path.basename( path.dirname( jsonPath ) );
  return path.join( REPORTS_ROOT, fileDir, fileName );
}

/**
 * Delete a Lighthouse run file.
 * @param {String} runFile Location of a Lighthouse run file.
 * @returns {String} Deleted filename or error message.
 */
async function deleteRun( runFile ) {
  await fs.unlink( runFile );
  return path.basename( runFile );
}

/**
 * Given a list of Lighthouse run data, pull out the useful info and return
 * a better-organized array.
 * @param {Array} runs List of Lighthouse runs.
 * @returns {Array} List of Lighthouse runs with additional metadata.
 */
function processManifestRuns( runs ) {
  return runs.map( run => {
    const runFilename = path.basename( run.jsonPath );
    const runDirectory = path.basename( path.dirname( run.jsonPath ) );
    // Report filenames are in the format: URL_YYYY_MM_DD_HH_MM_SS.report.json
    const details = runFilename.match( /(.+)_\-(\d\d\d\d_\d\d_\d\d)_\d\d_\d\d_\d\d\.report\.json/ );
    const slug = details[1];
    const date = details[2];
    return {
      slug,
      date,
      url: run.url.replace( '?mobile=1', '' ),
      jsonPath: `reports/${ runDirectory }/${ runFilename }`,
      formFactor: run.url.includes( '?mobile=1' ) ? 'mobile' : 'desktop',
      summary: run.summary
    };
  } );
}

/**
 * Given an array of Lighthouse runs from a manifest file, build an object
 * that organizes them by both date and page slug.
 * See test/fixtures/partial-index.json for an example of expected output.
 * @param {Array} runs List of Lighthouse runs.
 * @param {Object} index Object to add runs to.
 * @returns {Object} Object of Lighthouse runs organized by date and page.
 */
function buildIndex( runs, index = { dates: {}, pages: {}} ) {
  const reducer = ( index, run ) => {
    index.dates[run.date] = index.dates[run.date] || {};
    index.dates[run.date][run.slug] = index.dates[run.date][run.slug] || {};
    index.dates[run.date][run.slug].url = run.url;
    index.dates[run.date][run.slug][run.formFactor] = {
      jsonPath: run.jsonPath,
      summary: run.summary
    };
    index.pages[run.slug] = index.pages[run.slug] || {};
    index.pages[run.slug][run.date] = index.pages[run.slug][run.date] || {};
    index.pages[run.slug][run.date].url = run.url;
    index.pages[run.slug][run.date][run.formFactor] = {
      jsonPath: run.jsonPath,
      summary: run.summary
    };
    return index;
  };
  return runs.reduce( reducer, index );
}

module.exports = {
  REPORTS_ROOT,
  getManifests,
  readManifest,
  getRunLocation,
  deleteRun,
  getManifestRuns,
  processManifestRuns,
  buildIndex
};
