# cypress-dynamic-data

It showcases the use of:-

- Typescript
- The Cypress GUI tool
- The Cypress command line tool
- Cypress custom commands `cy.foo()`
- PageObject Models on a Login Site
- Resuable Web Selectors
- CircleCI integration
- Slack reporting
- Mochawesome for fancy HTML reporting
- DevTools console log output on test fail
- Integration with Cypress' Dashboard Service for project recording
- Docker to self contain the application and require no pre-requisites on the host machine, bar Docker.

## Dynamically generate data from CSV or XLS files

To convert Excel files to JSON

`make convertXLStoJSON` or `npm run convertXLStoJSON`

* File:- `testData/convertXLStoJSON.ts`
* Input:- `testData/testData.xlsx`
* Output:- `cypress/fixtures/testData.json`

To convert CSV to JSON

`make convertCSVtoJSON` or `yarn run convertCSVtoJSON`

* File:- `testData/convertCSVtoJSON.ts`
* Input:- `testData/testData.csv`
* Output:- `cypress/fixtures/testDataFromCSV.json`

To see the test in action

* `export CYPRESS_SUT_URL=https://the-internet.herokuapp.com`
*  `npx cypress open --env configFile=development` or `make test-local-gui`

Open the script `login.spec.ts` which will generate a test for every entry in the CSV or XLS (default) file.

If you wish to read from the CSV, in the file `cypress/integration/login.spec.ts`

Change `const testData = require("../fixtures/testData.json");` to

`const testData = require("../fixtures/testDataFromCSV.json");`

## Installation

- Clone the project

### Local Installation

- Run `yarn install` to install cypress
- We can slot this into any project easily and isolate its dependencies from your project
- View the `Makefile` for available commands

### Docker Installation

- Run `make docker-build` in the project
- View the `Makefile` for available docker commands

## Configuration

The main cypress configuration file

- `cypress.json`

It can contain configuration options applicable to all environments

Environment specific config files are stored in `config/<environment.json>`

These will override any configurations specific environment vars set in `cypress.json`

these can be set on the command line by

- `--env configFile=<environment.json>`

Currently supported environments are

- development
- production
- staging
- qa

If no option is provided is will default to the baseUrl defined in `config.json`

In order to setup development, you will need a website locally running and your CYPRESS_SUT_URL should be set.

`export CYPRESS_SUT_URL=<your_root_url>`

If you are using docker then please set your CYPRESS_SUT_URL in your docker-compose file, it is set in this example

```
        environment:
            - CYPRESS_SUT_URL=https://docker.for.mac.localhost
```

If it's CYPRESS_SUT_URL is not, and you select `--env configFile=development` the application will error, and ask you to set it.

## Running tests in Docker via Make

- `make docker-build` - Build the image
- `make docker-test-local` - Run the tests
- `make docker-bash` - Access the bash shell in the container

For more, see the Makefile

## Running tests locally via Make

- `make test-local`
- `make test-qa`
- `make test-staging`
- `make test-production`

## Direct from the command line

- `yarn run cypress:open` - runs test via gui
- `yarn run cypress:run` - run tests via command line
- `--env configFile=<env>` - select an environment specific config
- `-s '<pathToFile>'` path for the spec files you wish to run
  - `-s 'cypress/integration/commands.spec.js'` example

### GUI - Any changes made to test files are automatically picked up by the GUI and executed, post file save

- `make test-local-gui` Opens the GUI with the development configuration selection
- `make test-qa-gui` Opens the GUI with the qa configuration selection

The GUI can be opened by `npx cypress open` but requires a `--env configFile=<env>` option in order to set the correct BaseURL

### Reporting

Videos of each run are stored in `cypress/videos`

Screenshots of failing tests are stored in `cypress/screenshots`

Reports of test runs are generated with MochaAwesome are stored in `cypress/reports`

- One report is generated per spec file
- A report bundler is provided which will process each report in `cypress/reports` and combine them into a single HTML document with a random uuid title in `mochareports`
- The report bundler can be run with `make combine-reports && make generate-report`

```
combine-reports:
	npx mochawesome-merge --reportDir cypress/reports/mocha > mochareports/report-$$(date +'%Y%m%d-%H%M%S').json
```

```
generate-report:
	npx marge mochareports/*.json -f report-$$(date +'%Y%m%d-%H%M%S') -o mochareports
```

## Typescript

- Spec (test) files are written as `example.spec.ts` and contained in `cypress/integration`
- There is a `tsconfig.json` file
  - It includes the paths for the `.ts` files. If you add other paths for yours, include them here.
  - It contains the typescript options and includes the Cypress typings for code completion.
  - use visual studio code (if you aren't already) - it's free and comes feature packed.
- There is a `tslint.json` file
  - Contains some rules for code linting
- Tests are compiled with browserify typescript pre-processor.
  - It is loaded in `cypress/plugins/index.js`, hooking into cypress's `on` event.

## Intellisense

Add the following to your settings.json in VSCode for intellisense in `cypress.json`

```json
"json.schemas": [
  {
    "fileMatch": [
      "/cypress.json"
    ],
    "url": "https://raw.githubusercontent.com/cypress-io/cypress/develop/cli/schema/cypress.schema.json"
  }
]
```

## CircleCI

This project is building in CircleCI

See the `.circleci` folder

- `config.yml` - Contains the CircleCI build configuration

The circle config is setup to run `make circle-ci-qa` which will run tests against a specific environment

We can initiate the job via an API, passing in a cypress_sut variable, which should evaluate to a Makefile target.

```bash
    curl -u ${CIRCLE_TOKEN} -X POST --header "Content-Type: application/json" -d '{
    "build_parameters": {
        "cypress_sut": "circle-ci-staging"
    }
    }
    ' https://circleci.com/api/v1.1/project/<vcs-type>/<org>/<repo>/tree/<branch>
```

The following will trigger this repo, running the command `make circle-ci-staging`

The bash condition is as follows

```bash
    if [ -z ${cypress_sut+x} ]; then
        make circle-ci-qa
    else
        make $cypress_sut
    fi
```

### Slack Reporting

A bash file has been written in order to publish results

- `.circleci/slack-alert.sh`

It provides the following distinct message types

- Build Failure / Cypress error
- Test Failure
- Test Success

It provides the following information

- CircleCI Build Status
- Test Stats (Total Tests / Passes / Failures)
- Author with link to Github commit
- Branch name
- Pull Request number and link to PR (only if PR)

And the following build/test artefacts

- CircleCI Build Log button
- HTML Test report button (only on build success)
- Videos of test runs (one link per test)
- Screenshots of failed tests (one link per failing test)

You will need to set up a couple of things in order to use this.

First build a Slack app & create an incoming webhook

- https://api.slack.com/slack-apps

Set the following environment variable in your localhost or CI configuration

- `$SLACK_WEBHOOK_URL` - The full URL you created in the last step
- `$SLACK_API_CHANNEL` - The channel ref you wish to publish to (right-click on your channel and click copy link, check the link, its the digits after the last / )

### Cypress Dashboard Recording

CircleCI builds pass in a `CYPRESS_RECORD_KEY` in order to publish the results to the Cypress Dashboard.

We run `make test-record` to set the `--record` flag and publish the results to the dashboard.

## Accessibility Testing

We are using [Axe-Core](https://github.com/dequelabs/axe-core) for accessiblity testing via [Cypress-Axe](https://github.com/avanslaars/cypress-axe)

It can be actioned by doing the following ensuring that a `cy.visit()` operation has taken place prior, either in the test, or via a `beforeEach` hook

```
  it('passes accessibility check', () => {
    cy.injectAxe();
    cy.checkA11y();
  })
```

Rules can be viewed [here](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md) at a high level and in more detail [here](https://dequeuniversity.com/rules/axe/3.1)

## TODO

- Applitools Integration
