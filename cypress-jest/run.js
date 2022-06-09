const {pass, fail} = require('create-jest-runner')
const CypressNpmApi = require("cypress")


module.exports = async ({
  testPath,
  config: { rootDir = process.cwd(), ...options }
}) => {
  const results = await CypressNpmApi.run({
    spec: testPath,
    rootDir: process.cwd(),
    reporter:'',
    record: false,
  }).then(results => {
    return results;
  }) 
  if(results.totalFailed === 0){
    const start = Date.parse(results.startedTestsAt)
    const end = Date.parse(results.endedTestsAt)
    return pass({ start, end, test: {path:testPath}}); 
  }
  else if (results.runs[0].tests[0].error){
    const start = Date.parse(results.startedTestsAt)
    const end = Date.parse(results.endedTestsAt)
    const runError = results.runs[0].tests[0].error
    return fail({
      start,
      end,
      test: { path: testPath, runError, title: 'Error occurred' },
    });
  } 
};
