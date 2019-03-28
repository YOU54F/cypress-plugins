# cypress-slack-reporter [WIP]

A swiss army reporting tool built for Cypress but _should_ work with any mocha based framework.

<!-- [![CircleCI](https://circleci.com/gh/YOU54F/cypressio-docker-typescript.svg?style=svg)](https://circleci.com/gh/YOU54F/cypressio-docker-typescript)
[![Sonarcloud Status](https://sonarcloud.io/api/project_badges/measure?project=YOU54F_cypressio-docker-typescript&metric=alert_status)](https://sonarcloud.io/dashboard?id=YOU54F_cypressio-docker-typescript) -->

- Outputs mocha test reports in junit with mocha-junit-reporter
- Create HTML Test Reports with MochaAwesome
- Combine MochaAwesome Reports into a single web page.
- Slack reporter for integration with CirleCI
  - Reports Github/BB Triggering Commit Details
  - Reports CirleCI Build Logs / Status / Artefacts
  - Reports Test Status & Provides Report
- S3 Artefact dumping

## Adding to your cypress installation

- Add the following in the base of your project

cypress.json

```
{
  "reporter": "mocha-multi-reporters",
  "reporterOptions": {
    "configFile": "reporterOpts.json"
  }
}
```

reporterOpts.json

``` 
{
  "reporterEnabled": "mocha-junit-reporter, mochawesome",
  "mochaJunitReporterReporterOptions": {
    "mochaFile": "cypress/reports/junit/test_results[hash].xml",
    "toConsole": false
  },
  "mochawesomeReporterOptions": {
    "reportDir": "cypress/reports/mocha",
    "quiet": true,
    "overwrite": false
  }
}
```

### Reporting

- Videos of each run are stored in `e2e/cypress/videos`
- Screenshots of failing tests are stored in `e2e/cypress/screenshots`
- HTML Reports of test runs are generated with MochaAwesome are stored in `e2e/cypress/reports`
- One report is generated per spec file
- A report bundler is provided which will process each report in `e2e/cypress/reports` and combine them into a single HTML document with a random uuid title in `e2e/mochareports`
- The report bundler can be run with `make combine-reports`
- It can be published to an AWS S3 bucket with `make publish-reports-s3`
- To publish to a bucket, set the following env vars

```sh
 export BUCKET_NAME=<YOUR_BUCKET_NAME>
 export AWS_ACCESS_ID=<YOUR_AWS_ACCESS_ID>
 export AWS_SECRET_KEY=<YOUR_AWS_SECRET_KEY>
```

## CircleCI

This project is building in CircleCI and can be viewed at the following link

https://circleci.com/gh/YOU54F/cypressio-docker-typescript

See the `.circleci` folder

- `config.yml` - Contains the CircleCI build configuration

### Slack Reporting

A JS file has been written in order to publish results

- `e2e/scripts/slack/slack-alert.js`

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

- Convert to typescript and add some tests!
- publish to s3 bucket needs error handling, should exit each function gracefully if the directories are empty
