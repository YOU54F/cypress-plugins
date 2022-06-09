describe('Cypress parallel run example - 4', () => {
  it('should display the rss link', () => {
    cy.visit(`https://mherman.org`);
    cy.get('a').contains('RSS');
  });
});
