const path = require( 'path' );
const { promises: fs } = require( 'fs' );

const {
  getUrlWithoutMobileTestingParameter,
  hasMobileTestingParameter
} = require( './urls' );

// Location where the reports are stored, organized by timestamp
const REPORTS_ROOT = path.resolve( __dirname, '../../docs/reports' );

/**
 * Get list of Lighthouse report subdirectories.
 * @param {string} reportsDir - Lighthouse reports directory.
 * @returns {Array} List of report subdirectories.
 */
async function getReportSubdirectories( reportsDir ) {
  const reportDirs = await fs.readdir( reportsDir, { withFileTypes: true } );
  return reportDirs.filter( reportDir => reportDir.isDirectory() ).sort();
}

/**
 * Get list of Lighthouse report manifest locations.
 * @param {string} reportsDir - Location of lighthouse reports directory.
 * @returns {Array} List of manifest locations.
 */
async function getManifests( reportsDir ) {
  const subdirs = await getReportSubdirectories( reportsDir );

  return subdirs.map(
    reportDir => `${ reportsDir }/${ reportDir.name }/manifest.json`
  );
}

/**
 * Read manifest file.
 * @param {string} manifestLocation - Location of Lighthouse manifest file.
 * @returns {object} {returnawaitJSON.parse(fs.readFile(manifestFilename
 */
async function readManifest( manifestLocation ) {
  const manifest = await fs.readFile( manifestLocation );
  return JSON.parse( manifest );
}

/**
 * Get a list of a manifest's representative runs and its non-representative runs.
 * @param {object} manifest - Contents of a Lighthouse manifest file.
 * @returns {object} Two separate run arrays.
 */
function getManifestRuns( manifest ) {
  const runs = {
    repRuns: [],
    nonRepRuns: []
  };
  const reducer = ( prevRuns, run ) => ( {
    repRuns: run.isRepresentativeRun ?
      [ ...prevRuns.repRuns, run ] : [ ...prevRuns.repRuns ],
    nonRepRuns: run.isRepresentativeRun ?
      [ ...prevRuns.nonRepRuns ] : [ ...prevRuns.nonRepRuns, run ]
  } );
  return manifest.reduce( reducer, runs );
}

/**
 * Get the local location of a run's JSON. The manifest files store
 * their locations relative to GitHub Action's filesystem.
 * @param {string} jsonPath - Lighthouse run's JSON path from its manifest file.
 * @returns {string} Local location of run's JSON.
 */
function getRunLocation( jsonPath ) {
  const fileName = path.basename( jsonPath );
  const fileDir = path.basename( path.dirname( jsonPath ) );
  return path.join( REPORTS_ROOT, fileDir, fileName );
}

/**
 * Delete a Lighthouse run file.
 * @param {string} runFile - Location of a Lighthouse run file.
 * @returns {string} Deleted filename or error message.
 */
async function deleteRun( runFile ) {
  await fs.unlink( runFile );
  return path.basename( runFile );
}

/**
 * Given a list of Lighthouse run data, pull out the useful info and return
 * a better-organized array.
 * @param {Array} runs - List of Lighthouse runs.
 * @returns {Array} List of Lighthouse runs with additional metadata.
 */
function processManifestRuns( runs ) {
  return runs.map( run => {
    const runFilename = path.basename( run.jsonPath );
    const runDirectory = path.basename( path.dirname( run.jsonPath ) );

    // Report filenames are in the format:
    // %%HOSTNAME%%-%%PATHNAME%%-%%DATETIME%%.report.%%EXTENSION%%
    // https://github.com/GoogleChrome/lighthouse-ci/blob/master/docs/configuration.md#upload
    const details = runFilename.match( /(.+)-(\d\d\d\d_\d\d_\d\d)_\d\d_\d\d_\d\d\.report\.json/ );
    const slug = details[1];
    const date = details[2];
    return {
      slug,
      date,
      url: getUrlWithoutMobileTestingParameter( run.url ),
      jsonPath: `${ runDirectory }/${ runFilename }`,
      formFactor: hasMobileTestingParameter( run.url ) ? 'mobile' : 'desktop',
      summary: run.summary
    };
  } );
}

/**
 * Given an array of Lighthouse runs from a manifest file, build an object
 * that organizes them first by page slug and then by date.
 * See test/fixtures/partial-index.json for an example of expected output.
 * @param {Array} runs - List of Lighthouse runs.
 * @param {object} index - Object to add runs to.
 * @returns {object} Object of Lighthouse runs organized by date and page.
 */
function buildIndex( runs, index = { pages: {}} ) {
  const reducer = ( idx, run ) => {
    idx.pages[run.slug] = idx.pages[run.slug] || {};
    idx.pages[run.slug][run.date] = idx.pages[run.slug][run.date] || {};
    idx.pages[run.slug][run.date].url = run.url;
    idx.pages[run.slug][run.date][run.formFactor] = {
      jsonPath: run.jsonPath,
      summary: run.summary
    };
    return idx;
  };

  return runs.reduce( reducer, index );
}

module.exports = {
  REPORTS_ROOT,
  buildIndex,
  deleteRun,
  getManifestRuns,
  getManifests,
  getReportSubdirectories,
  getRunLocation,
  processManifestRuns,
  readManifest
};
