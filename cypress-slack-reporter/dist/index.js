#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const dotenv_1 = require("dotenv");
const globby = require("globby");
const SlackClient = __importStar(require("./slackClient"));
const path_1 = __importDefault(require("path"));
const getVideos = () => __awaiter(void 0, void 0, void 0, function* () {
    const paths = yield globby(path_1.default.resolve(process.cwd(), 'cypress', 'videos'), {
        expandDirectories: {
            files: ['*'],
            extensions: ['mp4']
        }
    });
    return paths;
});
const getReports = () => __awaiter(void 0, void 0, void 0, function* () {
    const paths = yield globby(path_1.default.resolve(process.cwd(), 'mochareports'), {
        expandDirectories: {
            files: ['*'],
            extensions: ['html', 'json']
        }
    });
    return paths;
});
const getScreenshots = () => __awaiter(void 0, void 0, void 0, function* () {
    const paths = yield globby(path_1.default.resolve(process.cwd(), 'cypress', 'screenshots'), {
        expandDirectories: {
            files: ['*'],
            extensions: ['png']
        }
    });
    return paths;
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!process.env.CI) {
        (0, dotenv_1.config)();
    }
    commander_1.program
        .version(`git@github.com:YOU54F/cypress-slack-reporter.git@2.alpha`, '-v, --version')
        .option('--vcs-provider [type]', 'VCS Provider [github|bitbucket|none]', 'github')
        .option('--ci-provider [type]', 'CI Provider [circleci|jenkins|bitbucket|none|custom]', 'circleci')
        .option('--custom-url [type]', 'On selected --ci-provider=custom this link will be set to Test Report', '')
        .option('--report-dir [type]', 'mochawesome json & html test report directory, relative to your packageon', 'mochareports')
        .option('--screenshot-dir [type]', 'cypress screenshot directory, relative to your packageon', 'cypress/screenshots')
        .option('--video-dir [type]', 'cypress video directory, relative to your packageon', 'cypress/videos')
        .option('--verbose', 'show log output')
        .option('--only-failed', 'only send message for failed tests')
        .option('--custom-text [type]', 'add additional text to message, wrap message in quotes')
        // .option("--s3", "upload artefacts to s3")
        .parse(process.argv);
    const options = commander_1.program.opts();
    const ciProvider = options.ciProvider;
    const vcsProvider = options.vcsProvider;
    const reportDir = options.reportDir;
    const videoDir = options.videoDir;
    const customUrl = options.customUrl;
    const screenshotDir = options.screenshotDir;
    const onlyFailed = options.onlyFailed;
    const customText = options.customText;
    // const verbose: boolean = program.verbose;
    if (options.verbose) {
        // tslint:disable-next-line: no-console
        console.log(' ciProvider:- ' + ciProvider + '\n', 'customUrl:- ' + customUrl + '\n', 'vcsProvider:- ' + vcsProvider + '\n', 'reportDirectory:- ' + reportDir + '\n', 'videoDirectory:- ' + videoDir + '\n', 'screenshotDirectory:- ' + screenshotDir + '\n');
    }
    const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
    const SLACK_TOKEN = process.env.SLACK_TOKEN;
    const videoPaths = yield getVideos();
    const screenshotPaths = yield getScreenshots();
    const reports = yield getReports();
    console.log('files and ting', videoPaths, screenshotPaths, reports);
    if (!SLACK_WEBHOOK_URL && !SLACK_TOKEN) {
        throw new Error('Cant send message without one of, [SLACK_WEBHOOK_URL,SLACK_TOKEN]');
    }
    if (SLACK_WEBHOOK_URL) {
        const client = SlackClient.getIncomingWebHookClient(SLACK_WEBHOOK_URL);
        SlackClient.sendViaWebhook({ status: 'test:failed' }, client)
            .then((res) => {
            if (res.text !== 'ok')
                console.log('webhook failure:', res.original.response.data);
            else
                console.log('webhook success:', res);
        })
            .catch((err) => console.log('webhook failure:', err));
    }
    if (SLACK_TOKEN) {
        const client = SlackClient.getChatBotClient(SLACK_TOKEN);
        SlackClient.sendViaBot({ status: 'test:failed', channel: 'github-test' }, client)
            .then((res) => {
            if (!res.ok)
                console.log('web-bot failure:', res.response ? res.response.data.response : res);
            else
                console.log('web-bot success:', res);
        })
            .catch((err) => console.log('web-bot failure:', err));
    }
});
main();
