'use strict';

const mocha = require('mocha');
const {Base} = mocha.reporters;

/**
 * This is a project-local custom reporter which is used as a stub in tests
 * to verify if loading reporters from a path (absolute or relative) is successful
 */
function CustomReporterStub(runner) {
    Base.call(this, runner);
}

module.exports = CustomReporterStub;
