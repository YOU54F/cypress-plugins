# cypress-slack-reporter [WIP]

A Slack Reporting tool built for Cypress but _should_ work with any mocha based framework that is using [mochawesome](https://github.com/adamgruber/mochawesome/)

<!-- [![CircleCI](https://circleci.com/gh/YOU54F/cypressio-slack-reporter.svg?style=svg)](https://circleci.com/gh/YOU54F/cypressio-slack-reporter)
[![Sonarcloud Status](https://sonarcloud.io/api/project_badges/measure?project=YOU54F_cypressio-slack-reporter&metric=alert_status)](https://sonarcloud.io/dashboard?id=YOU54F_cypressio-slack-reporter) -->

- Slack reporter for integration with CirleCI
  - Reports Github/BB Triggering Commit Details
  - Reports CirleCI Build Logs / Status / Artefacts
  - Reports Test Status & Provides Report
- Take the output of Mochawesome JSON output to determine test result & corresponding slack message
- Provide a URL link to the Test Artefacts (Mochawesome HTML Test Report / Cypress Video & Screenshots)
- S3 Artefact dumping

## Adding to your cypress installation

Yarn installation Instructions

``` sh
    $ yarn add mochawesome --dev
    $ yarn add mochawesome-merge --dev
    $ yarn add mochawesome-report-generator --dev
    $ yarn add mocha-multi-reporters --dev
    $ yarn add cypress-slack-reporter --dev
```

NPM installation Instructions

``` sh
    $ npm install mochawesome --save-dev
    $ npm install mochawesome-merge --save-dev
    $ npm install mochawesome-report-generator --save-dev
    $ npm install mocha-multi-reporters --save-dev
    $ npm install cypress-slack-reporter --save-dev
```


- Add the following in the base of your project

cypress.json

```json
{
  ...
  "reporter": "mocha-multi-reporters",
  "reporterOptions": {
    "configFile": "reporterOpts.json"
  }
}

```

reporterOpts.json

```json
{
  "reporterEnabled": "mochawesome",
  "mochawesomeReporterOptions": {
    "reportDir": "cypress/reports/mocha",
    "quiet": true,
    "overwrite": false,
    "html": false,
    "json": true
  }
}
```

### Reporting

- MP4 Video artefacts are expected to be in `cypress/videos`, unless otherwise specified
- Screenshots of failing tests are stored in `cypress/screenshots`
- HTML Reports of test runs are generated with MochaAwesome are stored in `cypress/reports`
- One report is generated per spec file
- A report bundler is provided which will process each report in `cypress/reports` and combine them into a single HTML document with a random uuid title in `mochareports`
- The report bundler can be run with `make combine-reports && make generate-report`

combine-reports:

    $ npx mochawesome-merge --reportDir cypress/reports/mocha > mochareports/report-$$(date +'%Y%m%d-%H%M%S').json

generate-report:

    $ npx marge mochareports/*.json -f report-$$(date +'%Y%m%d-%H%M%S') -o mochareports

- It can be published to an AWS S3 bucket with `make publish-reports-s3`
- To publish to a bucket, set the following env vars

```sh
 export BUCKET_NAME=<YOUR_BUCKET_NAME>
 export AWS_ACCESS_ID=<YOUR_AWS_ACCESS_ID>
 export AWS_SECRET_KEY=<YOUR_AWS_SECRET_KEY>
```

## CircleCI

This project is building in CircleCI and can be viewed at the following link

https://circleci.com/gh/YOU54F/cypress-slack-reporter

See the `.circleci` folder

- `config.yml` - Contains the CircleCI build configuration

### Slack Reporting

A TS file has been written in order to publish results

- `scripts/slack/slack-alert.ts`

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

Set the following environment variables in your localhost or CI configuration

- `$SLACK_WEBHOOK_URL` - The full URL you created in the last step
- `$SLACK_API_CHANNEL` - The channel ref you wish to publish to (right-click on your channel and click copy link, check the link, its the digits after the last / )

## TODO

- Document CLI options
- Move most things into dev dependencies
- Publish to NPM
- publish to s3 bucket needs error handling, should exit each function gracefully if the directories are empty
