# cypress-slack-reporter

A Slack Reporting tool built for Cypress but _should_ work with any mocha based framework that is using [mochawesome](https://github.com/adamgruber/mochawesome/)

<!-- [![CircleCI](https://circleci.com/gh/YOU54F/cypressio-slack-reporter.svg?style=svg)](https://circleci.com/gh/YOU54F/cypressio-slack-reporter)
[![Sonarcloud Status](https://sonarcloud.io/api/project_badges/measure?project=YOU54F_cypressio-slack-reporter&metric=alert_status)](https://sonarcloud.io/dashboard?id=YOU54F_cypressio-slack-reporter) -->

- Slack reporter for integration with CirleCI
  - Reports Github/BitBucket Triggering Commit Details
  - Reports CirleCI Build Logs / Status / Artefacts
  - Reports Test Status & Provides Report Links
- Takes the output of Mochawesome JSON output to determine test result & corresponding slack message
- Provides a URL link to the Test Artefacts (Mochawesome HTML Test Report / Cypress Video & Screenshots)

_note_ this has been tested on GitHub/Bitbucket using CircleCI only, at this current time.
I plan to provide a slimmed report for those not using CI, which can be triggered by a flag

## Reporting Features

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

## Installation

Note _Please see the pre-requisites folder to current neccessary pre-requisites_

1. Install the app

    $ yarn add cypress-slack-reporter --dev

    or

    $ npm install cypress-slack-reporter --save-dev

2. Create a Slack app & create an incoming webhook

- [Slack Apps](https://api.slack.com/slack-apps)

Set the following environment variables in your localhost or CI configuration.

- `$SLACK_WEBHOOK_URL` - The full URL you created in the last step

    $ export SLACK_WEBHOOK_URL=yourWebhookUrlHere

## Execution

    $ npx cypress-slack-reporter --help

      Usage: index.js [options]
      Options:
        -v, --version            output the version number
        --vcs-provider [type]    VCS Provider [github|bitbucket] (default: "github")
        --ci-provider [type]     CI Provider [circleci|none] (default: "circleci")
        --report-dir [type]      mochawesome html test report directory, relative to your package.json (default: "./mochareports")
        --screenshot-dir [type]  cypress screenshot directory, relative to your package.json (default: "./cypress/screenshots")
        --videos-dir [type]      cypress video directory, relative to your package.json (default: "./cypress/videos")
        -h, --help               output usage information

## Pre-Requisites

- A test tool capable of utilising mochawesome to report results
- [mochawesome](https://github.com/adamgruber/mochawesome/) for json test result generation
- [mochawesome-merge](https://github.com/Antontelesh/mochawesome-merge) to combine multiple mochawesome reports
- [mochawesome-report-generator](https://github.com/Antonteleshmochawesome-report-generator) to generate a HTML report, from your mochawesome json test results
- [mocha-multi-reporters](https://github.com/stanleyhlng/mocha-multi-reporters) to allow you to use multple reporters, in case you require other outputs (junit/spec etc)

Yarn installation Instructions

``` sh
    yarn add mochawesome --dev
    yarn add mochawesome-merge --dev
    yarn add mochawesome-report-generator --dev
    yarn add mocha-multi-reporters --dev
```

NPM installation Instructions

``` sh
    npm install mochawesome --save-dev
    npm install mochawesome-merge --save-dev
    npm install mochawesome-report-generator --save-dev
    npm install mocha-multi-reporters --save-dev
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

## CircleCI

This project is building in CircleCI and can be viewed at the following link

[CircleCI Build](https://circleci.com/gh/YOU54F/cypress-slack-reporter)

See the `.circleci` folder

- `config.yml` - Contains the CircleCI build configuration

The following env vars are read for CircleCI users.

- `CIRCLE_SHA1` - The SHA1 hash of the last commit of the current build
- `CIRCLE_BRANCH` - The name of the Git branch currently being built.
- `CIRCLE_USERNAME` - The GitHub or Bitbucket username of the user who triggered the build.
- `CIRCLE_BUILD_URL` - The URL for the current build.
- `CIRCLE_BUILD_NUM` - The number of the CircleCI build.
- `CIRCLE_PULL_REQUEST` - Comma-separated list of URLs of the current build’s associated pull requests.
- `CIRCLE_PROJECT_REPONAME` - The name of the repository of the current project.
- `CIRCLE_PROJECT_USERNAME` - The GitHub or Bitbucket username of the current project.
- `CI_URL="https://circleci.com/api/v1.1/project"`

If you wish to use another CI provider, you can pass any name other than `circleci` into the CLI flag `--ci-provider`, which will allow you to enter your own environment variables for CI.

- `CI_URL`
- `CI_SHA1`,
- `CI_BRANCH`,
- `CI_USERNAME`,
- `CI_BUILD_URL`,
- `CI_BUILD_NUM`,
- `CI_PULL_REQUEST`,
- `CI_PROJECT_REPONAME`
- `CI_PROJECT_USERNAME`

## TODO

- Publish to NPM
- Publish to NPM
- typescript s3 scripts and add to CLI
- publish to s3 bucket needs error handling, should exit each function gracefully if the directories are empty
