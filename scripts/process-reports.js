const path = require( 'path' );
const winston = require( 'winston' );
const { promises: fs } = require( 'fs' );

const {
  REPORTS_ROOT,
  buildIndex,
  deleteRun,
  getManifestRuns,
  getManifests,
  getReportSubdirectories,
  getRunLocation,
  readManifest,
  processManifestRuns
} = require( './lib/reports.js' );

const INDEX_LOCATION = path.resolve( __dirname, '../docs/reports.json' );

const KEEP_REPORTS_DAYS = 30;

const loggerFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf( info => `${ info.timestamp } ${ info.level }: ${ info.message }` )
);

const logger = winston.createLogger( {
  transports: [
    new winston.transports.Console( {
      format: loggerFormat
    } )
  ]
} );

/**
 * Delete any report subdirectories that are older than KEEP_REPORTS_DAYS.
 * @param {string} reportsRoot - Directory containing report subdirectories.
 */
async function deleteOldReportSubdirectories( reportsRoot ) {
  const deleteOlderThan = new Date();
  const deleteOlderThanDay = deleteOlderThan.getDate() - KEEP_REPORTS_DAYS;
  deleteOlderThan.setDate( deleteOlderThanDay );

  const subdirs = await getReportSubdirectories( reportsRoot );
  subdirs.forEach( async subdir => {
    if ( new Date( subdir.name ) < deleteOlderThan ) {
      logger.info( `Deleting old report directory ${ subdir.name }` );
      await fs.rmdir(
        path.join( reportsRoot, subdir.name ),
        { recursive: true }
      );
    }
  } );
}

/**
 * Iterate over all the timestamped report directories and return an object
 * that organizes them first by page slug and then by date.
 * See test/fixtures/full-index.json for an example of the expected output.
 *
 * This function also deletes any non-representative run reports in order to
 * save disk space.
 * @param {string} reportsRoot - Directory containing all the report subdirectories.
 * @returns {object} Object of Lighthouse runs organized by date and page.
 */
async function buildIndexOfAllReports( reportsRoot ) {
  const emptyIndex = { pages: {}};
  const manifests = await getManifests( reportsRoot );

  const reducer = async ( prevIndex, manifest ) => {
    manifest = await readManifest( manifest );
    const runs = getManifestRuns( manifest );

    // Delete non-representative runs while we're here
    runs.nonRepRuns.forEach( async nonRepRun => {
      const runLocation = getRunLocation( nonRepRun.jsonPath );
      try {
        const deletedRun = await deleteRun( runLocation );
        logger.verbose( `Deleted ${ deletedRun }.` );
      } catch ( err ) {
        logger.verbose( `Unable to delete ${ runLocation }. It might have already been deleted.` );
      }
    } );

    const processedRuns = processManifestRuns( runs.repRuns );
    return buildIndex( processedRuns, await prevIndex );
  };

  return manifests.reduce( reducer, emptyIndex );
}

( async () => {
  try {
    await deleteOldReportSubdirectories( REPORTS_ROOT );
    const index = await buildIndexOfAllReports( REPORTS_ROOT );
    await fs.writeFile( INDEX_LOCATION, JSON.stringify( index, 0, 2 ) );
    logger.info( `Successfully generated ${ INDEX_LOCATION }.` );
  } catch ( err ) {
    logger.error( err.toString() );
    // eslint-disable-next-line no-console
    console.error( err );
  }
} )();
