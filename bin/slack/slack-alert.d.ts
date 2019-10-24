import { MessageAttachment } from "@slack/types";
import { IncomingWebhookDefaultArguments, IncomingWebhookSendArguments } from "@slack/webhook";
export declare function slackRunner(ciProvider: string, vcsRoot: string, reportDir: string, videoDir: string, screenshotDir: string, logger: boolean): void;
export declare function sendMessage(_vcsRoot: string, _reportDir: string, _videoDir: string, _screenshotDir: string, _artefactUrl: string): void;
export declare function constructMessage(_status: string): Promise<import("@slack/webhook").IncomingWebhookResult>;
export declare function webhookInitialArgs(initialArgs: IncomingWebhookDefaultArguments, _status: string): {
    text: string;
};
export declare function webhookSendArgs(argsWebhookSend: IncomingWebhookSendArguments, messageAttachments: MessageAttachment[]): IncomingWebhookSendArguments;
export declare function attachmentReports(attachmentsReports: MessageAttachment, _status: string): MessageAttachment;
export declare function attachmentsVideoAndScreenshots(attachmentsVideosScreenshots: MessageAttachment, _status: string): MessageAttachment;
export declare function getFiles(dir: string, ext: string, fileList: string[]): string[];
export declare function getHTMLReportFilename(reportDir: string): string;
export declare function getTestReportStatus(reportDir: string): {
    totalSuites: number;
    totalTests: number;
    totalPasses: number;
    totalFailures: number;
    totalDuration: number;
    reportFile: string[];
    status: string;
};
export declare function prChecker(_CI_PULL_REQUEST: string): string | undefined;
export declare function getVideoLinks(_artefactUrl: string, _videosDir: string): string;
export declare function getScreenshotLinks(_artefactUrl: string, _screenshotDir: string): string;
export declare function buildHTMLReportURL(_reportDir: string, _artefactUrl: string): string;
export declare function getArtefactUrl(_vcsRoot: string, _artefactUrl: string): string;
export declare function getCommitUrl(_vcsRoot: string): string;
export declare function resolveCIProvider(ciProvider: string): void;
