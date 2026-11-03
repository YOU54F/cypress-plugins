// cypress/plugins/index.js

const wp = require('@cypress/webpack-preprocessor')
const pact = require('@pact-foundation/pact')
let server;
module.exports = (on,config) => {
  
  const options = {
    webpackOptions: require('../../webpack.config'),
  }
  on('file:preprocessor', wp(options))


  on('task', {
    createFakeServer (options) {
      server = new pact.Pact(options)
      return server.setup()
    },
    stopFakeServer () {
      server.finalize()
      return null
    },
    addInteraction (options) {
      return server.addInteraction(options)
    },
    verifyPacts () {
      return server.verify()
    }
  })

  return (on, config)
}