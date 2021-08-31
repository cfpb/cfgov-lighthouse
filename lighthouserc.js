const path = require( 'path' );

const { REPORTS_ROOT } = require( './scripts/lib/reports' );
const { getUrls } = require( './scripts/lib/urls' );

// eslint-disable-next-line no-process-env
const baseUrl = process.env.BASE_URL || 'https://www.consumerfinance.gov';

// Use custom --mobile flag to toggle between desktop and mobile testing.
const mobile = process.argv.some( arg => arg === '--mobile' );

// Store results in a folder named for the current timestamp.
const timestamp = new Date().toISOString();

module.exports = {
  ci: {
    collect: {
      url: getUrls( baseUrl, mobile ),
      settings: mobile ? null : { preset: 'desktop' }
    },
    upload: {
      target: 'filesystem',
      outputDir: path.join( REPORTS_ROOT, timestamp )
    }
  }
};
