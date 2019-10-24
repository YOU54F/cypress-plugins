#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var program = require("commander");
var fs = require("fs");
var slacker = require("./slack/slack-alert");
var version;
try {
    var json = JSON.parse(fs.readFileSync("./node_modules/cypress-slack-reporter/package.json", "utf8"));
    version = json.version;
}
catch (e) {
    try {
        var json = JSON.parse(fs.readFileSync("./node_modules/mochawesome-slack-reporter/package.json", "utf8"));
        version = json.version;
    }
    catch (e) {
        version = "Cannot determine version";
    }
}
var base = process.env.PWD || ".";
program
    .version("git@github.com:YOU54F/cypress-slack-reporter.git@" + version, "-v, --version")
    .option("--vcs-provider [type]", "VCS Provider [github|bitbucket|none]", "github")
    .option("--ci-provider [type]", "CI Provider [circleci|none]", "circleci")
    .option("--report-dir [type]", "mochawesome json & html test report directory, relative to your package.json", "mochareports")
    .option("--screenshot-dir [type]", "cypress screenshot directory, relative to your package.json", "cypress/screenshots")
    .option("--video-dir [type]", "cypress video directory, relative to your package.json", "cypress/videos")
    .option("--verbose", "show log output")
    .option("--logger", "show log output")
    // .option("--s3", "upload artefacts to s3")
    .parse(process.argv);
var ciProvider = program.ciProvider;
var vcsProvider = program.vcsProvider;
var reportDirectory = base + "/" + program.reportDir;
var videoDirectory = base + "/" + program.videoDir;
var screenshotDirectory = base + "/" + program.screenshotDir;
var verbose = program.verbose;
if (program.verbose || program.logger) {
    if (program.logger) {
        // tslint:disable-next-line: no-console
        console.log("--logger option will soon be deprecated, please switch to --verbose");
    }
    // tslint:disable-next-line: no-console
    console.log(" ciProvider:- " + ciProvider + "\n", "vcsProvider:- " + vcsProvider + "\n", "reportDirectory:- " + reportDirectory + "\n", "videoDirectory:- " + videoDirectory + "\n", "screenshotDirectory:- " + screenshotDirectory + "\n");
}
slacker.slackRunner(ciProvider, vcsProvider, reportDirectory, videoDirectory, screenshotDirectory, verbose);
