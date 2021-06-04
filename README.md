# cfgov-lighthouse

Automated testing of [consumerfinance.gov](https://www.consumerfinance.gov) using [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci/).

## Getting started

To serve the Lighthouse Report Summary dashboard on your local machine, use the command `yarn && yarn serve` and visit `http://127.0.0.1:8080` (hit `ctrl` + `c` when you're ready to stop the server).

To run a Lighthouse audit, use the command `yarn lighthouse`, which will run an audit against the URLs defined in [scriipts/lib/urls.js](https://github.com/cfpb/cfgov-lighthouse/blob/main/scripts/lib/urls.js).

## Getting involved

See [CONTRIBUTING](CONTRIBUTING.md).

----

## Open source licensing info
1. [TERMS](TERMS.md)
2. [LICENSE](LICENSE)
3. [CFPB Source Code Policy](https://github.com/cfpb/source-code-policy/)
