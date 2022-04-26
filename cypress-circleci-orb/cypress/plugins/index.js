// cypress/plugins/index.js

const fs = require('fs-extra')
const path = require('path')

module.exports = (on,config) => {
  
  // Output devtools console log to terminal on failed test
  // and save in cypress/logs
  on('task', {
    failed: require('cypress-failed-log/src/failed')(),
  })

  // process the configFile option flag and load
  // a new config file in cypress/config if value matches
  // default to base cypress.json config
  return processConfig(on, config)
}

function processConfig(on, config) {
  const file = config.env.configFile || 'no_env_default'
  return getConfigurationByFile(file).then(function(file) {
    if (config.env.configFile === 'development') {
      if (!process.env.URI_ROOT) {
        throw new Error('URI_ROOT not set - export URI_ROOT=http://yourlocalhost.com');
      }
      // append the URI_ROOT to the baseUrl
      file.baseUrl = file.baseUrl + process.env.URI_ROOT
    }
    // always return the file object
    return file
  })
}

function getConfigurationByFile(file) {
  const pathToConfigFile = path.resolve('cypress', 'config', `${file}.json`)
  return fs.readJson(pathToConfigFile)
}
// Adding applitoools, must be outside of module_exports
// require('@applitools/eyes.cypress')(module);
