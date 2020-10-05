const path = require( 'path' );
const winston = require( 'winston' );
const { promises: fs } = require( 'fs' );

const {
  REPORTS_ROOT,
  getRunLocation,
  deleteRun,
  getManifests,
  readManifest,
  getManifestRuns,
  processManifestRuns,
  buildIndex
} = require( './lib/reports.js' );

const INDEX_LOCATION = path.resolve( __dirname, '../docs/reports.json' );

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
 * Iterate over all the timestampped report directories and return an object
 * that organizes them by both date and page slug.
 * See test/fixtures/full-index.json for an example of the expected output.
 * @param {String} reportsRoot Directory containing all the report subdirectories.
 * @returns {Object} Object of Lighthouse runs organized by date and page.
 */
async function buildIndexOfAllReports( reportsRoot ) {
  const emptyIndex = { dates: {}, pages: {}};
  const manifests = await getManifests( reportsRoot );

  const reducer = async ( prevIndex, manifest ) => {
    manifest = await readManifest( manifest );
    const runs = getManifestRuns( manifest );

    // Delete non-representative runs while we're here
    runs.nonRepRuns.forEach( async nonRepRun => {
      const runLocation = getRunLocation( nonRepRun.jsonPath );
      try {
        const deletedRun = await deleteRun( runLocation );
        logger.info( `Deleted ${ deletedRun }.` );
      } catch ( err ) {
        logger.warn( `Unable to delete ${ runLocation }. It might have already been deleted.` );
      }
    } );

    const processedRuns = processManifestRuns( runs.repRuns );
    return buildIndex( processedRuns, await prevIndex );
  };

  return manifests.reduce( reducer, emptyIndex );
}

( async () => {
  try {
    const index = await buildIndexOfAllReports( REPORTS_ROOT );
    await fs.writeFile( INDEX_LOCATION, JSON.stringify( index, 0, 2 ) );
    logger.info( `Successfully generated ${ INDEX_LOCATION }.` );
  } catch ( err ) {
    logger.error( err );
  }
} )();
