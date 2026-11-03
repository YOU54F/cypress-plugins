'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const Mocha = require('mocha');
const MultiReporters = require('../../lib/MultiReporters');

const {Runner, Suite} = Mocha;

describe('reporter resolution from the project directory', function () {
    let projectDir;
    let originalCwd;

    beforeEach(function () {
        originalCwd = process.cwd();
        projectDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'multi-reporters-')));
        const reporterDir = path.join(projectDir, 'node_modules', 'project-only-reporter');
        fs.mkdirSync(reporterDir, {recursive: true});
        fs.writeFileSync(
            path.join(reporterDir, 'index.js'),
            'module.exports = function ProjectOnlyReporter() { this.loaded = true; };\n'
        );
        process.chdir(projectDir);
    });

    afterEach(function () {
        process.chdir(originalCwd);
        fs.rmSync(projectDir, {recursive: true, force: true});
    });

    it('loads a reporter only installed in the working directory node_modules', function () {
        const mocha = new Mocha({reporter: MultiReporters});
        const runner = new Runner(new Suite('#project-resolution', 'root'));
        const reporter = new mocha._reporter(runner, {
            reporterOptions: {reporterEnabled: 'project-only-reporter'}
        });

        expect(reporter._reporters).to.have.lengthOf(1);
        expect(reporter._reporters[0]).to.have.property('loaded', true);
    });
});
