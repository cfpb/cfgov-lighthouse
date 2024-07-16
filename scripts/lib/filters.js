/**
 * Custom Nunjucks filter that returns an SVG icon for the Lighthouse scores.
 * @param {number} score - Lighthouse score between 0 and 1.
 * @returns {string} SVG icon (or empty string)
 */
function scoreIcon( score ) {
  let icon = '';
  if ( score < 0.5 ) {
    icon = `
      <svg class="u-fill-red cf-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1200">
          <path d="M500 105.2c-276.1 0-500 223.9-500 500s223.9 500 500 500 500-223.9 500-500-223.9-500-500-500zm261.8 692.2c19.4 19.6 19.3 51.3-.3 70.7-19.5 19.3-50.9 19.3-70.4 0L499.6 676.6 308 868.1c-19.6 19.4-51.3 19.3-70.7-.3-19.3-19.5-19.3-50.9 0-70.4l191.6-191.5-191.6-191.6c-19.3-19.8-18.9-51.4.9-70.7 19.4-18.9 50.4-18.9 69.8 0l191.6 191.5 191.5-191.5c19.6-19.4 51.3-19.3 70.7.3 19.3 19.5 19.3 50.9 0 70.4L570.3 605.9l191.5 191.5z"></path>
      </svg>
      `;
  } else if ( score >= 0.5 && score < 0.9 ) {
    icon = `
      <svg class="u-fill-gold cf-icon-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1200">
          <path d="M500 105.2c-276.1 0-500 223.9-500 500s223.9 500 500 500 500-223.9 500-500-223.9-500-500-500zm-49.7 234.6c0-27.6 22.4-50 50-50s50 22.4 50 50v328.6c0 27.6-22.4 50-50 50s-50-22.4-50-50V339.8zm50 582.5c-39.6 0-71.7-32.1-71.7-71.7s32.1-71.7 71.7-71.7S572 811 572 850.6s-32.1 71.7-71.7 71.7z">
      </svg>
      `;
  }
  return icon;
}

module.exports = {
  scoreIcon
};
