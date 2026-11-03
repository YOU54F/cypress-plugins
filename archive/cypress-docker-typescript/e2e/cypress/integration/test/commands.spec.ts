import { add } from '../../support/helpers/add'

describe('Testing Global Namespace Commands.ts', () => {
  it('works', () => {
    // note TypeScript definition
    const x: number = 42
  })

  it('uses custom command cy.foo()', () => {
    cy.foo().should('be.equal', 'foo')
  })

  it('uses custom command cy.foo2() which returns the result of cy.foo()', () => {
    cy.foo2().should('be.equal', 'foo')
  })

  it('can import helper functions - add 2 numbers', () => {
    expect(add(2, 3)).to.equal(5)
  })

  it('adds numbers - Yields sum of 2 numbers', () => {
    cy.sum(2, 3).should('equal', 5)
  })

  it('can print a default message to console.log', () => {
    cy.greeting()
  })

  it('can accept user args to print to console.log', () => {
    cy.greeting({ greeting: 'Hello', name: 'Friend' })
  })

  it('checks shape of an object', () => {
    const object = {
      age: 21,
      name: 'Joe',
    }
    expect(object).to.have.all.keys('name', 'age')
  })

  it('uses cy commands', () => {
    cy.wrap({}).should('deep.eq', {})
  })

  it('tests cypress.io\s example site', () => {
    cy.visit('https://example.cypress.io/')
    cy.get('.home-list')
      .contains('Querying')
      .click()
    cy.get('#query-btn').should('contain', 'Button')
  })

  it('has Cypress object type definition', () => {
    expect(Cypress.version).to.be.a('string')
  })

  it('adds numbers - from support/helpers functions', () => {
    expect(add(2, 3)).to.equal(5)
  })
})