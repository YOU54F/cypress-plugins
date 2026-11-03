describe('Cypress parallel run example - 1', () => {
  it('should display the title', () => {
    cy.visit(`https://mherman.org`);
    cy.get('a').contains('Michael Herman');
  });
});
