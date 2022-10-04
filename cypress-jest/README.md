# cypress-jest

![npm version](https://img.shields.io/npm/v/cypress-jest.svg)
![npm](https://img.shields.io/npm/dm/cypress-jest.svg)
[![Build Status](https://travis-ci.org/YOU54F/cypress-jest.svg?branch=master)](https://travis-ci.org/YOU54F/cypress-jest)
[![Dependency Status](https://img.shields.io/david/you54f/cypress-jest.svg?style=flat-square)](https://david-dm.org/you54f/cypress-jest)
[![devDependency Status](https://img.shields.io/david/dev/you54f/cypress-jest.svg?style=flat-square)](https://david-dm.org/you54f/cypress-jest#info=devDependencies)
[![CircleCI](https://circleci.com/gh/YOU54F/cypress-jest.svg?style=svg)](https://circleci.com/gh/YOU54F/cypress-jest)

Jest runner for cypress.io

## Usage

```sh
npm install --save-dev cypress-jest
```

Your `jest.config.js` should look like this:

```js
module.exports = {
  projects: [
    {
      displayName: 'cypress',
      runner: 'cypress-jest',
      testMatch: ['<rootDir>/**/*-cy.js']
    },
    {
      displayName: 'test' // Your other unit Tests with jest
    }
  ]
}
```

## TO

- [ ] Silence Cypress STDOUT, so we just see jest's console output

## Credits

This project is inspired by the work of TheBrainFamily & DanielMSchmidt in various projects:

* [jest-runner-cypress](https://github.com/TheBrainFamily/jest-runner-cypress)
* [jest-runner-standard](https://github.com/TheBrainFamily/jest-runner-standard)
* [jest-runner-cypress-io](https://github.com/DanielMSchmidt/jest-runner-cypress-io)
