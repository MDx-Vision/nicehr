beforeEach(() => {
  cy.exec('npx tsx seed.ts', { timeout: 30000 });
});
