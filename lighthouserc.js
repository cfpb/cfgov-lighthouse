const fs = require( 'fs' );

const BASE_URL = 'https://www.consumerfinance.gov';

const timestamp = new Date().toISOString();

// eslint-disable-next-line no-sync
const urlsTxt = fs.readFileSync( 'urls.txt', 'utf-8' ).split( '\n' );

// Filter out any lines that don't start with /
let urls = urlsTxt.filter( url => url.match( /^\// ) );

// Remove any duplicates from the list, and sort.
urls = [ ...new Set( urls ) ].sort();

// Prepend URLs with domain name.
urls = urls.map( url => BASE_URL + url );

module.exports = {
  ci: {
    collect: {
      url: urls
    },
    upload: {
      target: 'filesystem',
      outputDir: `docs/reports/${ timestamp }`
    }
  }
};
