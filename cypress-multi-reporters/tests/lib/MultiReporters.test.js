'use strict';

const Mocha = require('mocha');
const sinon = require('sinon');
const {Suite} = Mocha;
const {Runner} = Mocha;
const {Test} = Mocha;

describe('lib/MultiReporters', function () {
    let MultiReporters;

    before(function () {
        MultiReporters = require('../../lib/MultiReporters');
    });

    describe('#static', function () {
        describe('#CONFIG_FILE', function () {
            it('equals to "../config.json"', function () {
                expect(MultiReporters.CONFIG_FILE).to.be.equals('../config.json');
            });
        });
    });

    describe('#instance', function () {
        let mocha;
        let suite;
        let runner;
        let reporter;
        let options;

        describe('#internal', function () {
            beforeEach(function () {
                mocha = new Mocha({
                    reporter: MultiReporters
                });
                suite = new Suite('#internal-multi-reporter', 'root');
                runner = new Runner(suite);
                options = {
                    execute: false,
                    reporterOptions: {
                        configFile: 'tests/custom-internal-config.json'
                    }
                };
                reporter = new mocha._reporter(runner, options);
            });

            describe('#done (failures, fn)', function () {
                let failures, fn;

                beforeEach(function () {
                    sinon.stub(console, 'error');
                    failures = 2;
                    fn = sinon.stub();
                });

                afterEach(function () {
                    console.error.restore();
                });

                it('logs an error message to the console when no reporters have been registered', function() {
                    reporter.done(failures, fn);

                    expect(fn.callCount).to.equal(0);
                    expect(console.error.callCount).to.equal(1);
                    expect(console.error.firstCall.args).to.deep.equal(['Unable to invoke fn(failures) - no reporters were registered']);
                });

                it('executes fn(failures) after applying the done method on each reporter', function() {
                    const reporterA = { done: sinon.stub().callsArg(1) };
                    const reporterB = {};
                    const reporterC = { done: sinon.stub().callsArg(1) };

                    reporter._reporters = [reporterA, reporterB, reporterC];

                    reporter.done(failures, fn);

                    expect(reporterA.done.callCount).to.equal(1);
                    expect(reporterA.done.firstCall.args[0]).to.equal(failures);
                    expect(typeof reporterA.done.firstCall.args[1]).to.equal('function');

                    expect(reporterC.done.callCount).to.equal(1);
                    expect(reporterC.done.firstCall.args[0]).to.equal(failures);
                    expect(typeof reporterC.done.firstCall.args[1]).to.equal('function');

                    expect(fn.callCount).to.equal(1);
                    expect(fn.calledAfter(reporterA.done)).to.be.true;
                    expect(fn.calledAfter(reporterC.done)).to.be.true;
                    expect(fn.firstCall.args).to.deep.equal([failures]);
                });

                it('executes fn(failures) when none of the registered reporters have a #done handler', function () {
                    reporter._reporters = [{}, {}];

                    reporter.done(failures, fn);

                    expect(fn.callCount).to.equal(1);
                    expect(fn.firstCall.args).to.deep.equal([failures]);
                });
            });

            describe('#options (reporters - single)', function () {
                it('return reporter options: "dot"', function () {
                    expect(reporter.getReporterOptions(reporter.getOptions(options), 'dot')).to.be.deep.equal({
                        id: 'dot'
                    });
                });

                it('return reporter options: "xunit"', function () {
                    expect(reporter.getReporterOptions(reporter.getOptions(options), 'xunit')).to.be.deep.equal({
                        id: 'xunit',
                        output: 'artifacts/test/custom-xunit.xml'
                    });
                });
            });

            describe('#options (reporters - multiple)', function () {
                it('return default options', function () {
                    expect(reporter.getDefaultOptions()).to.be.deep.equal({
                        reporterEnabled: 'spec, xunit',
                        reporterOptions: {
                            id: 'default'
                        },
                        dotReporterOptions: {
                            id: 'dot'
                        },
                        xunitReporterOptions: {
                            id: 'xunit',
                            output: 'xunit.xml'
                        },
                        tapReporterOptions: {
                            id: 'tap'
                        }
                    });
                });

                it('return custom options', function () {
                    expect(reporter.getCustomOptions(options)).to.be.deep.equal({
                        reporterEnabled: 'dot, tests/custom-internal-reporter',
                        xunitReporterOptions: {
                            output: 'artifacts/test/custom-xunit.xml'
                        }
                    });
                });

                it('return resultant options by merging both default and custom options', function () {
                    expect(reporter.getOptions(options)).to.be.deep.equal({
                        reporterEnabled: 'dot, tests/custom-internal-reporter',
                        reporterOptions: {
                            id: 'default'
                        },
                        dotReporterOptions: {
                            id: 'dot'
                        },
                        xunitReporterOptions: {
                            id: 'xunit',
                            output: 'artifacts/test/custom-xunit.xml'
                        },
                        tapReporterOptions: {
                            id: 'tap'
                        }
                    });
                });
            });

            describe('#custom-internal-reporter', function () {
                beforeEach(function() {
                    options = {
                        execute: true,
                        reporterOptions: {
                            configFile: 'tests/custom-internal-config.json'
                        }
                    };
                    reporter = new mocha._reporter(runner, options);
                });

                it('return default options for "custom-internal-reporter"', function () {
                    expect(reporter.getReporterOptions(reporter.getOptions(options), 'custom-internal-reporter')).to.be.deep.equal({
                        id: 'default',
                    });
                });
            });

            describe('#custom-internal-reporter (array config)', function () {
                beforeEach(function() {
                    options = {
                        execute: true,
                        reporterOptions: {
                            configFile: 'tests/custom-internal-config-array.json'
                        }
                    };
                    reporter = new mocha._reporter(runner, options);
                });

                it('return default options for "custom-internal-reporter"', function () {
                    expect(reporter.getReporterOptions(reporter.getOptions(options), 'custom-internal-reporter')).to.be.deep.equal({
                        id: 'default',
                    });
                });
            });

            describe('#custom-erring-internal-reporter', function () {
                beforeEach(function() {
                    options = {
                        execute: true,
                        reporterOptions: {
                            configFile: 'tests/custom-erring-internal-config.json'
                        }
                    };
                });

                it('catches error for "custom-erring-internal-reporter"', function () {
                    expect(function () {
                        reporter = new mocha._reporter(runner, options);
                    }).to.not.throw(Error);
                });
            });
        });

        describe('#internal (with dynamic output)', function () {
            beforeEach(function () {
                mocha = new Mocha({
                    reporter: MultiReporters
                });
                suite = new Suite('#internal-multi-reporter', 'root');
                runner = new Runner(suite);
                options = {
                    execute: false,
                    reporterOptions: {
                        configFile: 'tests/custom-internal-config.json'
                    }
                };
                reporter = new mocha._reporter(runner, options);
            });
            it('return reporter options: "customID" (dynamic output)', function () {
                expect(reporter.getReporterOptions(reporter.getOptions({
                    reporterOptions: {
                        cmrOutput: 'tests/custom-internal-reporter+output+customName',
                        configFile: 'tests/custom-internal-dynamic-output-config.json'
                    }
                }), 'tests/custom-internal-reporter')).to.be.deep.equal({
                    id: 'customID',
                    output: 'artifacts/test/custom-internal-customName.xml'
                });
            });

            it('ignores non-matching reporter options with dynamic output', function () {
                expect(reporter.getReporterOptions(reporter.getOptions({
                    reporterOptions: {
                        cmrOutput: 'tests/custom-internal-reporter+output+customName',
                        configFile: 'tests/custom-internal-dynamic-output-config.json'
                    }
                }), 'xunit')).to.be.deep.equal({
                    id: 'xunit',
                    output: 'artifacts/test/custom-xunit.xml'
                });

                expect(reporter.getReporterOptions(reporter.getOptions({
                    reporterOptions: {
                        cmrOutput: 'tests/custom-internal-reporter+output+customName',
                        configFile: 'tests/custom-internal-dynamic-output-config.json'
                    }
                }), 'mocha-junit-reporter')).to.be.deep.equal({
                    id: 'mocha-junit-reporter',
                    mochaFile: 'junit.xml'
                });

                expect(reporter.getReporterOptions(reporter.getOptions({
                    reporterOptions: {
                        cmrOutput: ['tests/custom-internal-reporter', 'output', 'customName'],
                        configFile: 'tests/custom-internal-dynamic-output-config.json'
                    }
                }), 'mocha-junit-reporter')).to.be.deep.equal({
                    id: 'mocha-junit-reporter',
                    mochaFile: 'junit.xml'
                });
            });
        });

        describe('#external', function () {
            const checkReporterOptions = function (options) {
                expect(reporter.getReporterOptions(reporter.getOptions(options), 'mocha-junit-reporter')).to.be.deep.equal({
                    id: 'mocha-junit-reporter',
                    mochaFile: 'junit.xml'
                });
            };

            describe('json', function() {
                beforeEach(function () {
                    mocha = new Mocha({
                        reporter: MultiReporters
                    });
                    suite = new Suite('#external-multi-reporter', 'root');
                    runner = new Runner(suite);
                    options = {
                        execute: false,
                        reporterOptions: {
                            configFile: 'tests/custom-external-config.json'
                        }
                    };
                    reporter = new mocha._reporter(runner, options);
                });

                describe('#options (external reporters w/ json - single)', function () {
                    it('json: return reporter options: "dot"', function () {
                        checkReporterOptions(options);
                    });
                });
            });

            describe('js', function() {
                beforeEach(function () {
                    mocha = new Mocha({
                        reporter: MultiReporters
                    });
                    suite = new Suite('#external-multi-reporter', 'root');
                    runner = new Runner(suite);
                    options = {
                        execute: false,
                        reporterOptions: {
                            configFile: 'tests/custom-external-config.js'
                        }
                    };
                    reporter = new mocha._reporter(runner, options);
                });

                describe('#options (external reporters w/ commonjs - single)', function () {
                    it('commonjs: return reporter options: "dot"', function () {
                        checkReporterOptions(options);
                    });
                });
            });

            describe('erring (json)', function() {
                beforeEach(function () {
                    mocha = new Mocha({
                        reporter: MultiReporters
                    });
                    suite = new Suite('#external-multi-reporter', 'root');
                    runner = new Runner(suite);
                    options = {
                        execute: true,
                        reporterOptions: {
                            configFile: 'tests/custom-bad-config.json'
                        }
                    };
                });

                describe('#options (external reporters w/ json - single)', function () {
                    it('catches errors with bad reporter name', function () {
                        expect(function () {
                            reporter = new mocha._reporter(runner, options);
                        }).to.not.throw(Error);
                    });
                });
            });

            describe('#custom-erring-external-reporter', function () {
                beforeEach(function() {
                    options = {
                        execute: true,
                        reporterOptions: {
                            configFile: 'tests/custom-erring-external-config.json'
                        }
                    };
                });

                it('catches error for "custom-erring-external-reporter"', function () {
                    expect(function () {
                        reporter = new mocha._reporter(runner, options);
                    }).to.not.throw(Error);
                });
            });
        });

        describe('#exception', function () {
            let err;
            beforeEach(function () {
                options = {
                    execute: false,
                    reporterOptions: {
                        configFile: 'tests/custom-external-config.json'
                    }
                };

                err = new Error('JSON.parse error!');
                sinon.stub(JSON, 'parse').throws(err);
            });

            afterEach(function () {
                JSON.parse.restore();
            });

            it('throw an exception in default options', function () {
                expect(JSON.parse.callCount).to.equal(0);
                expect(reporter.getDefaultOptions.bind(this)).to.throw(err);
                expect(JSON.parse.threw()).to.equal(true);
                expect(JSON.parse.callCount).to.equal(1);
            });

            it('throw an exception in custom options', function () {
                expect(JSON.parse.callCount).to.equal(0);
                expect(reporter.getCustomOptions.bind(this, options)).to.throw(err);
                expect(JSON.parse.threw()).to.equal(true);
                expect(JSON.parse.callCount).to.equal(1);
            });
        });
    });

    describe('#test', function () {
        let suite;
        let runner;

        beforeEach(function () {
            const mocha = new Mocha({
                reporter: MultiReporters
            });
            suite = new Suite('#multi-reporter', 'root');
            runner = new Runner(suite);
            new mocha._reporter(runner);
        });

        it('should have 1 test failure', function (done) {
            const tests = [
                {
                    title: '#test-1',
                    state: 'passed'
                },
                {
                    title: '#test-2',
                    state: 'failed'
                }
            ];

            tests.map(function (test) {
                suite.addTest(new Test(test.title, function (done) {
                    if (test.state === 'passed') {
                        done();
                    }
                    else {
                        done(new Error(test.error));
                    }
                }));
            });

            runner.run(function (failureCount) {
                expect(failureCount).to.equals(1);

                // stats
                expect(runner.stats).to.be.include({
                    suites: 1,
                    tests: 2,
                    passes: 1,
                    pending: 0,
                    failures: 1
                });

                // suites
                expect(runner.suite.title).to.equal('#multi-reporter');
                expect(runner.suite.tests).to.be.instanceof(Array);
                expect(runner.suite.tests).to.have.length(2);

                // test
                const [, test] = runner.suite.tests;
                expect(test.title).to.equal('#test-2');
                expect(test.state).to.equal('failed');

                done();
            });
        });

        it('should have 1 test pending', function (done) {
            const tests = [
                {
                    title: '#test-1'
                },
                {
                    title: '#test-2'
                }
            ];

            tests.map(function (test) {
                suite.addTest(new Test(test.title));
            });

            runner.run(function (failureCount) {
                expect(failureCount).to.equals(0);

                // stats
                expect(runner.stats).to.be.include({
                    suites: 1,
                    tests: 2,
                    passes: 0,
                    pending: 2,
                    failures: 0
                });

                // suites
                expect(runner.suite.title).to.be.equal('#multi-reporter');
                expect(runner.suite.tests).to.be.instanceof(Array);
                expect(runner.suite.tests).to.have.length(2);

                // test
                const [test] = runner.suite.tests;
                expect(test.title).to.be.equal('#test-1');
                expect(test.pending).to.equal(true);

                done();
            });
        });
    });
});
