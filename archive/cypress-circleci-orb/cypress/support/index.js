// ***********************************************************
// support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js
import './commands'

// Import additional apps
import 'cypress-failed-log'
// import '@applitools/eyes.cypress/commands'

beforeEach(function () {
    cy.log('Test Started')
  })

  afterEach(function () {
    cy.log('Test Completed')
  })

  before(function () {
    cy.log('Test Suite Started')
  })

  after(function () {
    cy.log('Test Suite Completed')
  })
  