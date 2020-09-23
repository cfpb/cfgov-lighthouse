const fs = require( 'fs' );
const path = require( 'path' );

const { getCleanedUrl } = require( './urls' );

const REPORTS_ROOT = path.resolve( __dirname, '../../docs/reports' );

const MANIFEST_FILENAME = 'manifest.json';

class LighthouseSummaryReport {

  constructor( timestampString ) {
    this.timestamp = new Date( timestampString );

    this._manifestFilename = path.join(
      REPORTS_ROOT,
      timestampString,
      MANIFEST_FILENAME
    );

    this.pages = this._parseManifest( this._manifestFilename );
    this.nonRepresentativeRuns = this._getNonRepRuns( this._manifestFilename );
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
      const url = getCleanedUrl( runs[0].url );

      const reports = new Map(
        runs
          .map( this._parseRun )
          .map( report => [ report.name, report ] )
      );

      return {
        url: new URL( url ),
        reports: reports
      };
    } );

    return pages.sort( ( a, b ) => a.url > b.url );
  }

  _getNonRepRuns( manifestFilename ) {
    // eslint-disable-next-line no-sync
    const manifest = JSON.parse( fs.readFileSync( manifestFilename ) );

    const nonRepresentativeRuns = manifest.filter(
      run => !run.isRepresentativeRun
    );

    return nonRepresentativeRuns;
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
