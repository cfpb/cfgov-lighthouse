const LIGHTHOUSE_VIEWER = 'https://googlechrome.github.io/lighthouse/viewer/';

document.querySelectorAll( 'a.report-link' ).forEach( a => {
  const jsonUrl = window.location + a.getAttribute( 'href' );

  a.setAttribute( 'href', `${ LIGHTHOUSE_VIEWER }?jsonurl=${ jsonUrl }` );
} );
