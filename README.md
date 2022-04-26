# cypress-plugins

Various cypress plugins, some of which I've created, some I've adopted. 

It's easier for me to have them all in one place.

- `cypress-jest` - A jest test runner to execute Cypress tests
- `cypress-openapi` - Generate cypress tests from OpenAPI specs
- `cypress-buckets` - split your cypress test files into multiple circleci workflows
- `cypress-circleci` - split your cypress test files into multiple circleci workflows
- `cypress-cognito-srp` - login via cognito for `USER_SRP_AUTH` auth flow, via name and password
- `cypress-dynamic-data` - generate test data from Excel or CSV files.
- `cypress-slack-reporter` - send rich test results to slack
- `cypress-multi-reporters` - Use multiple reporters in your tests

## Templates

- `cypress-pact` - generate a scaffold project utilising @pactflow/pact-cypress-adapter
- `cypress-msw-pact` - generate a scaffold project utilising @pactflow/pact-msw-adapter
- `cypress-serverless` - run cypress in a lambda with serverless
- `cypress-docker-typescript` - Will scaffold the example repository used to showcase the plugins, in a location of the users choice.  

## Documentation

- `cypress-plugins-site` - The website, built with Docusaurus V2 and deployed via Vercel

## Example

The `cypress-docker-typescript` scaffolded example will generate a project with the following.

It contains

- `Typescript`
- The `Cypress` GUI tool
- The `Cypress` CLI tool
- `CircleCI` / `GitHub Actions` workflows 
- `cypress-mochawesome-reporter` for fancy test reports
- `cypress-slack-reporter` for upload your reports to slck
- `cypress-failed-logs` devTools console log output on test fail
- Easy to wire up with Cypress' Dashboard Service for project recording
- `Dockerfile` to self contain the application and require no pre-requisites on the host machine, bar `Docker`.