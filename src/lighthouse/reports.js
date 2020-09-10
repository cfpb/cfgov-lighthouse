const fs = require( 'fs' );
const path = require( 'path' );

const { getCleanedUrl } = require( './urls' );

const REPORTS_ROOT = path.resolve( __dirname, '../../docs/reports' );

const MANIFEST_FILENAME = 'manifest.json';

class LighthouseSummaryReport {

  constructor( timestamp ) {
    this.timestamp = timestamp;

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

    const runsByUrl = this._groupBy(
      representativeRuns,
      run => getCleanedUrl( run.url )
    );

    const pages = runsByUrl.map( runs => {
      const reports = runs.map( this._parseRun );

      return {
        url: getCleanedUrl( runs[0].url ),
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
    const jsonParts = manifestRun.jsonPath.split( '/' ).slice( -2 );
    const jsonPath = jsonParts.join( '/' );

    const jsonFilename = path.join( REPORTS_ROOT, jsonPath );

    // eslint-disable-next-line no-sync
    const report = JSON.parse( fs.readFileSync( jsonFilename ) );

    return {
      name: report.configSettings.emulatedFormFactor,
      jsonPath: `reports/${ jsonPath }`,
      summary: manifestRun.summary
    };
  }
}

module.exports = {
  LighthouseSummaryReport,
  REPORTS_ROOT
};
