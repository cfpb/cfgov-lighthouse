const test = require( 'ava' );
const path = require( 'path' );
const { promises: fs } = require( 'fs' );

const {
  deleteRun,
  getManifests,
  readManifest,
  getManifestRuns,
  processManifestRuns,
  buildIndex
} = require( '../scripts/lib/reports.js' );

const REPORTS_ROOT = path.resolve( __dirname, 'fixtures/sample-reports' );

test( 'Get list of manifests from reports directory', async t => {
  const manifests = await getManifests( REPORTS_ROOT );
  t.deepEqual( manifests.length, 4, 'There should be four manifests in the fixtures directory.' );
  t.regex( manifests[0], new RegExp( 'fixtures/sample-reports/2020-09-29T00:56:16.943Z/manifest.json$' ) );
  t.regex( manifests[1], new RegExp( 'fixtures/sample-reports/2020-09-30T00:56:26.599Z/manifest.json$' ) );
  t.regex( manifests[2], new RegExp( 'fixtures/sample-reports/2020-10-01T00:56:50.516Z/manifest.json$' ) );
  t.regex( manifests[3], new RegExp( 'fixtures/sample-reports/2020-10-02T00:57:10.925Z/manifest.json$' ) );
} );

test( 'Read a manifest', async t => {
  const reallyCoolManifest = path.resolve( __dirname, 'fixtures/sample-reports/2020-09-29T00:56:16.943Z/manifest.json' );
  const manifestContents = await readManifest( reallyCoolManifest );
  t.deepEqual( Object.keys( manifestContents ).length, 144, 'The Sept. 29th lighthouse report manifest should have 144 entries.' );
} );

test( 'Delete a run file', async t => {
  const reallyCoolRun = path.resolve( __dirname, 'fixtures/sample-reports/2020-09-29T00:56:16.943Z/temp-run-file.json' );
  await fs.writeFile( reallyCoolRun, '' );
  await t.notThrowsAsync( fs.readFile( reallyCoolRun ), 'The fake temporary run file should have been created.' );
  await deleteRun( reallyCoolRun );
  await t.throwsAsync( fs.readFile( reallyCoolRun ), { code: 'ENOENT' }, 'The fake temporary run file should have been deleted.' );
} );

test( 'Get a manifest\'s runs', async t => {
  const expected = JSON.parse( await fs.readFile( path.resolve( __dirname, 'fixtures/get-runs.json' ) ) );

  const reallyCoolManifest = path.resolve( __dirname, 'fixtures/sample-reports/2020-09-29T00:56:16.943Z/manifest.json' );
  const manifest = await readManifest( reallyCoolManifest );
  const runs = getManifestRuns( manifest );
  t.deepEqual( runs, expected );
} );

test( 'Process a manifest\'s runs', async t => {
  const expected = JSON.parse( await fs.readFile( path.resolve( __dirname, 'fixtures/processed-runs.json' ) ) );

  const reallyCoolManifest = path.resolve( __dirname, 'fixtures/sample-reports/2020-09-29T00:56:16.943Z/manifest.json' );
  const manifest = await readManifest( reallyCoolManifest );
  const runs = processManifestRuns( getManifestRuns( manifest ).repRuns );
  t.deepEqual( runs, expected );
} );

test( 'Build an index of runs from a single report', async t => {
  const expected = JSON.parse( await fs.readFile( path.resolve( __dirname, 'fixtures/partial-index.json' ) ) );
  const runs = JSON.parse( await fs.readFile( path.resolve( __dirname, 'fixtures/processed-runs.json' ) ) );

  const index = buildIndex( runs );
  t.deepEqual( index, expected );
} );

test( 'Build an index of runs from all the reports', async t => {
  const expected = JSON.parse( await fs.readFile( path.resolve( __dirname, 'fixtures/full-index.json' ) ) );
  const emptyIndex = { pages: {}};
  const manifests = await getManifests( REPORTS_ROOT );

  const reducer = async ( prevIndex, manifest ) => {
    manifest = await readManifest( manifest );
    const runs = getManifestRuns( manifest );
    const processedRuns = processManifestRuns( runs.repRuns );
    return buildIndex( processedRuns, await prevIndex );
  };

  const index = await manifests.reduce( reducer, emptyIndex );
  t.deepEqual( index, expected );
} );
