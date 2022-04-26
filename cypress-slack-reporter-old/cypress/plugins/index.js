// cypress/plugins/index.js

const wp = require('@cypress/webpack-preprocessor')

module.exports = (on,config) => {
  
  // Load webpack typescript pre processor
  const options = {
    webpackOptions: require('../../webpack.config'),
  }
  on('file:preprocessor', wp(options))

  return (on, config)
}

