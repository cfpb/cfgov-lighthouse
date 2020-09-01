const fs = require( 'fs' );
const path = require( 'path' );

const REPORTS_ROOT = path.resolve( __dirname, '../../docs/reports' );

const MANIFEST_FILENAME = 'manifest.json';

class LighthouseSummaryReport {

  constructor( timestamp ) {
    this._timestamp = timestamp;

    this._manifestFilename = path.join(
      REPORTS_ROOT,
      timestamp,
      MANIFEST_FILENAME
    );

    this.pages = this._parseManifest( this._manifestFilename );
  }

  _parseManifest( manifestFilename ) {
    // eslint-disable-next-line no-sync
    const manifest = JSON.parse( fs.readFileSync( manifestFilename ) );

    const representativeRuns = manifest.filter(
      run => run.isRepresentativeRun
    );

    const runsByUrl = this._groupBy( representativeRuns, run => run.url );

    const pages = runsByUrl.map( runs => {
      const reports = runs.map( this._parseRun );

      return {
        url: runs[0].url,
        reports: reports.sort( ( a, b ) => a.name > b.name )
      };
    } );

    return pages.sort( ( a, b ) => a.url > b.url );
  }

  _groupBy( seq, keyGetter ) {
    const map = new Map();

    seq.forEach( item => {
      const key = keyGetter( item );

      const grouped = map.get( key );

      if ( grouped ) {
        grouped.push( item );
      } else {
        map.set( key, [ item ] );
      }
    } );

    return [ ...map.values() ];
  }

  _parseRun( manifestRun ) {
    const jsonParts = manifestRun.jsonPath.split( '/' ).reverse();
    const jsonFilename = jsonParts[0];
    const reportTimestamp = jsonParts[1];

    const jsonFilenameFull = path.join(
      REPORTS_ROOT,
      reportTimestamp,
      jsonFilename
    );

    // eslint-disable-next-line no-sync
    const report = JSON.parse( fs.readFileSync( jsonFilenameFull ) );

    return {
      name: report.configSettings.emulatedFormFactor,
      jsonFilename: jsonFilename,
      summary: manifestRun.summary
    };
  }
}

module.exports = {
  LighthouseSummaryReport,
  REPORTS_ROOT
};
