# cypress-serverless

[![CircleCI](https://circleci.com/gh/YOU54F/cypress-serverless.svg?style=svg)](https://circleci.com/gh/YOU54F/cypress-serverless)

## TODO

- Update readme with serverless instructions
- Build cypress deps in seperate layer and run in tests seperately

Based on the [Fork](https://github.com/stuartsan/cypress-lambda)

See below for the readme from the original project

This repo demonstrates how to run [Cypress](https://cypress.io) on AWS Lambda, executing each spec file in parallel.

The [blog post, part 1](https://stuartsandine.com/cypress-on-aws-lambda-part-1) walks through the nitty gritty of getting a single
Cypress spec running on Lambda (see branch `part-1` for where this leaves off).

[Part 2](https://stuartsandine.com/cypress-on-aws-lambda-part-2) contains details on invoking a Lambda function for each spec file and collecting the results in an mochawesome report.

*Warning* this is a prototype and it hasn't been battle-tested.


## How do I use this?

**Requirements**: docker, terraform, nodejs >= 8

### First build the image to gather dependencies

```
cd lambda
docker build . -t cypress-lambda
```

### Extract dependencies from container

```
./deps.sh
```

### Invoke Lambda handler locally

Verify that the handler invocation works when run locally with 
[docker-lambda](https://github.com/lambci/docker-lambda)'s: nodejs8.10 runtime,
a dockerized replica of the AWS Lambda execution environment:

```
docker run --rm -v "$PWD":/var/task:ro lambci/lambda:nodejs8.10
```

### Deploy it

Back in the project root:

```
touch lambda.zip
terraform init
terraform apply
```
(You'll have to change a couple things in `lambda.tf` for your situation, 
such as the s3 bucket name, which is globally unique)

### Invoke it
In the project root, first:

```
npm install
```

And then:

```
npm test
```

This will invoke the deployed Lambda function once for each spec file, collect individual mochawesome JSON reports for each Lambda invocation, merge together the JSON reports, and produce a single mochawesome HTML report.


### Use your own tests

So right now this is using the [cypress kitchensink example](https://github.com/cypress-io/cypress-example-kitchensink); you'll want to put your own tests in `lambda/cypress/integration` and then go through all the steps above again.
