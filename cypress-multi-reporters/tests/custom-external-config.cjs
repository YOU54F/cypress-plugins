'use strict';

module.exports = {
    reporterEnabled: 'mocha-junit-reporter',

    mochaJunitReporterReporterOptions: {
        id: 'mocha-junit-reporter',
        mochaFile: 'junit.xml'
    }
};
