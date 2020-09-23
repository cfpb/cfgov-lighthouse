/* eslint-disable no-console */
const fs = require( 'fs' );
const path = require( 'path' );

const CI_ROOT = '/home/runner/work/cfgov-lighthouse/cfgov-lighthouse/';

/**
 * Takes a summary report and deletes all "non-representative" runs from
 * the filesystem to save disk space.
 * @param {Object} summaryReport A LighthouseSummaryReport (see reports.js)
 */
const cleanUpRuns = summaryReport => {

  summaryReport.nonRepresentativeRuns.forEach( run => {

    const filePath = path.join( __dirname, '../../', run.jsonPath.replace( CI_ROOT, '' ) );
    const fileName = filePath.split( '/' ).pop();

    fs.unlink( filePath, err => {
      if ( err ) {
        return console.error( `Tried to delete ${ fileName } but failed. It might already be deleted.` );
      }
      return console.log( `Deleted non-representative run ${ fileName }.` );
    } );

  } );
};

module.exports = cleanUpRuns;
