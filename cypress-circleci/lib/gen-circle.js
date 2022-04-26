const path = require('path');
const fs = require('fs');

const yaml = require('write-yaml');


/*
  helpers
*/

function createJSON(fileArray, data) {
  const jobs = [];
  for (const [index, value] of fileArray.entries()) {
    jobs.push(`test${index + 1}`);
    data.jobs[`test${index + 1}`] = {
      working_directory: '~/tmp',
      docker: [
        {
          image: 'cypress/base:10',
          environment: {
            TERM: 'xterm',
          },
        },
      ],
      steps: [
        {
          attach_workspace: {
            at: '~/',
          },
        },
        {
          run: 'ls -la cypress',
        },
        {
          run: 'ls -la cypress/integration',
        },
        {
          run: {
            name: `Setting mochawesome report filename to test${index + 1}`,
            command:`echo 'export MOCHAWESOME_REPORTFILENAME=test${index + 1}' >> $BASH_ENV`,
          },
        },
        {
          run: {
            name: `Running cypress tests ${index + 1}`,
            command: `if $(npm bin)/cypress run --spec cypress/integration/${value}; then echo 'pass'; else echo 'fail'; fi`,
          },
        },
        {
          store_artifacts: {
            path: 'cypress/videos',
          },
        },
        {
          store_artifacts: {
            path: 'cypress/screenshots',
          },
        },
        {
          store_artifacts: {
            path: 'mochawesome-report',
          },
        },
        {
          persist_to_workspace: {
            root: './',
            paths: [
              `mochawesome-report/test${index + 1}.json`,
              `mochawesome-report/test${index + 1}.html`,
              'cypress/screenshots',
              'cypress/videos'
            ],
          },
        },
      ],
    };
    data.workflows.build_and_test.jobs.push({
      [`test${index + 1}`]: {
        requires: [
          'build',
        ],
      },
    });
  }
  data.workflows.build_and_test.jobs.push({
    combine_reports: {
      'requires': jobs,
    },
  });
  return data;
}

function writeFile(data) {
  yaml(path.join(process.cwd(),'.circleci', 'config.yml'), data, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Success!');
    }
  });
}


/*
  main
*/

console.log('Looking for specs in the following directory',process.cwd())
// get spec files as an array
const files = fs.readdirSync((path.join(process.cwd(),'cypress','integration'))).filter(fn => fn.endsWith('.spec.js'));

console.log('Processing the following spec files')
// read circle.json
const circleConfigJSON = require(path.join(__dirname, 'circle.json'));
// add cypress specs to object as test jobs
const data = createJSON(files, circleConfigJSON);
// write file to disc
writeFile(data);
