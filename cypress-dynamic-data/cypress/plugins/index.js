// cypress/plugins/index.js

const browserify = require('@cypress/browserify-preprocessor')
const fs = require("fs-extra");
const path = require("path");

module.exports = (on, config) => {
  // Load browserify typescript pre processor
  const options = 
    {
      browserifyOptions: {
        extensions: ['.js', '.ts'],
        plugin: [
          ['tsify']
        ]
      }
    }
  ;
  on('file:preprocessor', browserify(options))

  // Output devtools console log to terminal on failed test
  // and save in cypress/logs
  on("task", {
    failed: require("cypress-failed-log/src/failed")()
  });

  on("before:browser:launch", (browser = {}, args) => {
    if (browser.name === "chrome") {
      args.push("--disable-features=CrossSiteDocumentBlockingIfIsolating,CrossSiteDocumentBlockingAlways,IsolateOrigins,site-per-process");
      args.push("--load-extension=cypress/extensions/Ignore-X-Frame-headers_v1.1");
      return args;
    }
  });
  // process the configFile option flag and load
  // a new config file in cypress/config if value matches
  // default to base cypress.json config
  return processConfig(on, config);
};

function processConfig(on, config) {
  const file = config.env.configFile || "no_env_default";
  return getConfigurationByFile(file).then(function(file) {
    if (config.env.configFile === "development" && !file.baseUrl) {
      if (!process.env.CYPRESS_SUT_URL) {
        throw new Error(
          "CYPRESS_SUT_URL not set - export CYPRESS_SUT_URL=https://cypress.<intials>.test"
        );
      }
      // append the CYPRESS_SUT_URL to the baseUrl
      file.baseUrl = process.env.CYPRESS_SUT_URL;
    }

    // always return the file object
    return file;
  });
}

function getConfigurationByFile(file) {
  const pathToConfigFile = path.resolve("cypress", "config", `${file}.json`);
  return fs.readJson(pathToConfigFile);
}
