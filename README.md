# cfgov-lighthouse

Automated testing of [consumerfinance.gov](https://www.consumerfinance.gov) using [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci/).

## Getting started

To serve the Lighthouse Report Summary dashboard on your local machine,
use the command `yarn && yarn serve` and visit `http://127.0.0.1:8080`
(hit `ctrl` + `c` when you're ready to stop the server).

This installs the dependencies. If you received an error
`Module not found: Error: Can't resolve …` in regard to the font files,
follow the next step to install the fonts.

### Install font files

To install self-hosted fonts locally, place the font files
in `./static/fonts/`. This can be done with the command `yarn fonts`.

### Run Lighthouse audit

To run a Lighthouse audit, use the command `yarn lighthouse`. This command
looks for a file named `urls.txt`, containing a list of relative URL paths
to test. If this file does not exist, only the root of the domain is tested.

This repository is automatically updated each night using GitHub Actions.
The relative URLs being tested are loaded from a URL configured using a
repository secret named `TEST_PAGES_URL`.

## Getting involved

See [CONTRIBUTING](CONTRIBUTING.md).

----

## Open source licensing info
1. [TERMS](TERMS.md)
2. [LICENSE](LICENSE)
3. [CFPB Source Code Policy](https://github.com/cfpb/source-code-policy/)
