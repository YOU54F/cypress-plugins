describe('Cypress parallel run example - 3', () => {
  it('should display the about link', () => {
    cy.visit(`https://mherman.org`);
    cy.get('a').contains('About');
  });
});
