"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageConstructor = void 0;
const slack_1 = require("./slack");
const slack_block_builder_1 = require("slack-block-builder");
const messageConstructor = ({ headingText, channel, status, customBlocks }) => {
    const messageBuilder = (0, slack_block_builder_1.Message)({ channel, text: headingText }).blocks(slack_block_builder_1.Blocks.Section({
        text: headingText !== null && headingText !== void 0 ? headingText : 'Cypress Slack Reporter'
    }), slack_block_builder_1.Blocks.Divider(), slack_block_builder_1.Blocks.Actions().elements(status !== slack_1.cypressRunStatus['build:failed']
        ? slack_block_builder_1.Elements.Button({
            text: 'Test Report'
        })
            .danger(status === slack_1.cypressRunStatus['test:failed'])
            .primary(status !== slack_1.cypressRunStatus['test:failed'])
        : undefined, slack_block_builder_1.Elements.Button({
        text: 'Build Logs'
    })
        .danger(status === slack_1.cypressRunStatus['build:failed'])
        .primary(status !== slack_1.cypressRunStatus['build:failed'])));
    return customBlocks
        ? messageBuilder.blocks(...customBlocks).buildToObject()
        : messageBuilder.buildToObject();
};
exports.messageConstructor = messageConstructor;
