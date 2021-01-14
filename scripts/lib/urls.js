const urls = [
  '/',
  '/about-us/blog/',
  '/about-us/blog/economic-impact-payment-prepaid-card/',
  '/about-us/blog/guide-covid-19-economic-stimulus-checks/',
  '/about-us/blog/protect-yourself-financially-from-impact-of-coronavirus/',
  '/about-us/contact-us/',
  '/ask-cfpb/',
  '/ask-cfpb/how-can-i-tell-who-owns-my-mortgage-en-214/',
  '/ask-cfpb/what-is-a-debt-to-income-ratio-why-is-the-43-debt-to-income-ratio-important-en-1791/',
  '/ask-cfpb/what-is-forbearance-en-289/',
  '/ask-cfpb/what-is-the-best-way-to-negotiate-a-settlement-with-a-debt-collector-en-1447/',
  '/ask-cfpb/what-should-i-do-when-a-debt-collector-contacts-me-en-1695/',
  '/complaint/',
  '/complaint/getting-started/',
  '/consumer-tools/prepaid-cards/',
  '/coronavirus/',
  '/coronavirus/managing-your-finances/economic-impact-payment-prepaid-debit-cards/',
  '/coronavirus/mortgage-and-housing-assistance/',
  '/coronavirus/student-loans/',
  '/find-a-housing-counselor/',
  '/learnmore/',
  '/owning-a-home/',
  '/policy-compliance/rulemaking/regulations/',
  '/start-small-save-up/start-saving/'
];

const MOBILE_QUERY_STRING_PARAM = 'mobile';

/**
 * Generate a list of absolute URLs for testing.
 * @param {string} baseUrl Base URL, e.g. https://www.consumerfinance.gov.
 * @param {boolean} mobile Whether URLs should be decorated for mobile testing.
 * @returns {URL[]} List of absolute URLs.
 */
function getUrls( baseUrl, mobile ) {
  return urls.map( url => {
    const absoluteUrl = new URL( url, baseUrl );

    if ( mobile ) {
      absoluteUrl.searchParams.set( MOBILE_QUERY_STRING_PARAM, '1' );
    }

    return absoluteUrl;
  } );
}

/**
 * Remove mobile testing parameter from a URL, if it exists.
 * @param {string} url URL, e.g. https://www.consumerfinance.gov/?mobile=1.
 * @returns {URL} URL without mobile testing parameter.
 */
function getUrlWithoutMobileTestingParameter( url ) {
  const urlObj = new URL( url );

  urlObj.searchParams.delete( MOBILE_QUERY_STRING_PARAM );

  return urlObj.href;
}

/**
 * Test if a URL has been decorated for mobile testing.
 * @param {string} url URL, e.g. https://www.consumerfinance.gov.
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
