module.exports = {
  appName: 'cypress-docker',
  showLogs: false,
  isDisabled: true,
  batchName: 'test batch'
  // to enable, remove comments from support/index.js & plugins/index.js
  // there is an error in the afterhook, when isDisabled is set to true!
  // Error: Cannot read property 'error' of undefined
  // Because this error occurred during a 'after all' hook we are skipping all of the remaining tests.
  // at Context.send.then.resp (https://applitools.com/__cypress/tests?p=cypress/support/index.js-695:1742:15)
}