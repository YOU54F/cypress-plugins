#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line: no-reference
/// <reference path='../../node_modules/cypress/types/cypress-npm-api.d.ts'/>
var CypressNpmApi = require("cypress");
// import { logger } from "../logger";
var slack_alert_1 = require("../slack/slack-alert");
// tslint:disable: no-var-requires
var marge = require("mochawesome-report-generator");
var merge = require("mochawesome-merge").merge;
// tslint:disable: no-var-requires
CypressNpmApi.run({
    reporter: "cypress-multi-reporters",
    reporterOptions: {
        reporterEnabled: "mocha-junit-reporter, mochawesome",
        mochaJunitReporterReporterOptions: {
            mochaFile: "cypress/reports/junit/test_results[hash].xml",
            toConsole: false
        },
        mochawesomeReporterOptions: {
            reportDir: "cypress/reports/mocha",
            quiet: true,
            overwrite: true,
            html: false,
            json: true
        }
    }
})
    .then(function (results) { return __awaiter(void 0, void 0, void 0, function () {
    var generatedReport;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Promise.resolve(generateReport({
                    reportDir: "cypress/reports/mocha",
                    inline: true,
                    saveJson: true
                }))];
            case 1:
                generatedReport = _a.sent();
                // tslint:disable-next-line: no-console
                console.log("Merged report available here:-", generatedReport);
                return [2 /*return*/, generatedReport];
        }
    });
}); })
    .then(function (generatedReport) {
    var base = process.env.PWD || ".";
    var program = {
        ciProvider: "circleci",
        videoDir: base + "/cypress/videos",
        vcsProvider: "github",
        screenshotDir: base + "/cypress/screenshots",
        verbose: true,
        reportDir: base + "/cypress/reports/mocha"
    };
    var ciProvider = program.ciProvider;
    var vcsProvider = program.vcsProvider;
    var reportDirectory = program.reportDir;
    var videoDirectory = program.videoDir;
    var screenshotDirectory = program.screenshotDir;
    var verbose = program.verbose;
    // tslint:disable-next-line: no-console
    console.log("Constructing Slack message with the following options", {
        ciProvider: ciProvider,
        vcsProvider: vcsProvider,
        reportDirectory: reportDirectory,
        videoDirectory: videoDirectory,
        screenshotDirectory: screenshotDirectory,
        verbose: verbose
    });
    var slack = slack_alert_1.slackRunner(ciProvider, vcsProvider, reportDirectory, videoDirectory, screenshotDirectory, verbose);
    // tslint:disable-next-line: no-console
    console.log("Finished slack upload");
})
    .catch(function (err) {
    // tslint:disable-next-line: no-console
    console.log(err);
});
function generateReport(options) {
    return merge(options).then(function (report) { return marge.create(report, options); });
}
