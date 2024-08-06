const fs = require( 'fs' );
const path = require( 'path' );

const MOBILE_QUERY_STRING_PARAM = 'mobile';

const URL_PATHS_FILENAME = 'urls.txt';

/**
 * Get a list of relative URL paths for testing.
 * Try reading the paths from a file if it exists, otherwise default to only
 * testing against the site root path.
 * @returns {string[]} List of relative URL paths.
 */
function getUrlPaths() {
  const pathsFilename = path.resolve( process.cwd(), URL_PATHS_FILENAME );

  // eslint-disable-next-line no-sync
  if ( fs.existsSync( pathsFilename ) ) {
    // eslint-disable-next-line no-sync
    return fs.readFileSync( pathsFilename ).toString().split( '\n' );
  }

  return [ '/' ];
}

/**
 * Generate a list of absolute URLs for testing.
 * @param {string} baseUrl - Base URL, e.g. https://www.consumerfinance.gov.
 * @param {boolean} mobile - Whether URLs should be decorated for mobile testing.
 * @returns {URL[]} List of absolute URLs.
 */
function getUrls( baseUrl, mobile ) {
  const urlPaths = getUrlPaths();

  return urlPaths.map( urlPath => {
    const url = new URL( urlPath, baseUrl );

    if ( mobile ) {
      url.searchParams.set( MOBILE_QUERY_STRING_PARAM, '1' );
    }

    return url;
  } );
}

/**
 * Remove mobile testing parameter from a URL, if it exists.
 * @param {string} url - URL, e.g. https://www.consumerfinance.gov/?mobile=1.
 * @returns {URL} URL without mobile testing parameter.
 */
function getUrlWithoutMobileTestingParameter( url ) {
  const urlObj = new URL( url );

  urlObj.searchParams.delete( MOBILE_QUERY_STRING_PARAM );

  return urlObj.href;
}

/**
 * Test if a URL has been decorated for mobile testing.
 * @param {string} url - URL, e.g. https://www.consumerfinance.gov.
 * @returns {boolean} Whether the URL has the ?mobile testing flag.
 */
function hasMobileTestingParameter( url ) {
  return new URL( url ).searchParams.has( MOBILE_QUERY_STRING_PARAM );
}

module.exports = {
  getUrls,
  getUrlWithoutMobileTestingParameter,
  hasMobileTestingParameter
};
