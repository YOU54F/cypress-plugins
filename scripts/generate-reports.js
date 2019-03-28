const uuidv1 = require('uuid/v1');
const shell = require('shelljs');
const combine = require('./combine.js');

// generate mochawesome report
const data = combine.combineMochaAwesomeReports();
const uuid = uuidv1();
combine.writeReport(data, uuid);
shell.exec(`./node_modules/.bin/marge mochareports/${uuid}.json  --reportDir mochareports`, (code, stdout, stderr) => {
  if (stderr) throw stderr;
});