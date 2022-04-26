

module.exports = {
  projects: [
    {
      displayName: 'cypress',
      runner: './index.js',
      testMatch: ['<rootDir>/**/cypress/integration/**/actions.spec.js'],      
    }
    
  ]
}