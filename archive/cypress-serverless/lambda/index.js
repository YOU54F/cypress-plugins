const Xvfb = require("xvfb.js");
const cypress = require("cypress");
const child_process = require("child_process");
const fs = require('fs');

process.env.CYPRESS_RUN_BINARY = "/tmp/lib/Cypress";
process.env.CYPRESS_CACHE_FOLDER = "/tmp";
process.env.XDG_CONFIG_HOME = "/tmp";

var xvfb = new Xvfb({
  xvfb_executable: "./Xvfb",
  dry_run: false
});

let libExtracted = false;

exports.handler = function(event, context) {
  if (!libExtracted) {
    child_process.execSync("rm -rf /tmp/* && tar xzf lib.tar.gz -C /tmp", {
      stdio: "inherit"
    });
    child_process.execSync("cp /var/task/cypress.json /tmp/cypress.json", {
      stdio: "inherit"
    });
    child_process.execSync("cp -R /var/task/cypress /tmp", {
      stdio: "inherit"
    });
    child_process.execSync("ln -s /var/task/node_modules /tmp/node_modules", {
      stdio: "inherit"
    });
    child_process.execSync("mkdir /tmp/shm", { stdio: "inherit" });
    libExtracted = true;
  }

  xvfb.start((err, xvfbProcess) => {
    if (err) context.done(err);

    function done(err, result) {
      xvfb.stop(err => context.done(err, result));
    }

    cypress
      .run({
        spec: event.cypressSpec || '/tmp/cypress/integration/**/*.spec.js',
        env: {
          DEBUG: "cypress:*",
          XDG_CONFIG_HOME: "/tmp"
        },
        config: {
          video: false
        },
        record: true,
        project: "/tmp",
        reporter: 'mochawesome',
        // This also works!
        // headed: true
      })
      .then(results => {
        const report = fs.readFileSync('/tmp/mochawesome-report/mochawesome.json').toString()
        done(null, report);
      })
      .catch(err => {
        done(err);
      });
  });
};
