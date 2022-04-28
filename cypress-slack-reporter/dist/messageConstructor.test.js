"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const slack_1 = require("./slack");
const messageConstructor_1 = require("./messageConstructor");
// export const messageConstructor = ({
//   headingText,
//   channel,
//   status,
//   customBlocks
// }: {
//   headingText?: string;
//   channel?: string;
//   status: cypressRunStatus;
//   customBlocks?: Appendable<BlockBuilder>;
// }) => {
//   const messageBuilder = Message({ channel, text: headingText }).blocks(
//     Blocks.Section({
//       text: headingText
//     }),
//     Blocks.Divider(),
//     Blocks.Actions().elements(
//       status !== cypressRunStatus['build:failed']
//         ? Elements.Button({
//             text: 'Test Report'
//           })
//             .danger(status === cypressRunStatus['test:failed'])
//             .primary(status !== cypressRunStatus['test:failed'])
//         : undefined,
//       Elements.Button({
//         text: 'Build Logs'
//       })
//         .danger(status === cypressRunStatus['build:failed'])
//         .primary(status !== cypressRunStatus['build:failed'])
//     )
//   );
//   return customBlocks
//     ? messageBuilder.blocks(...customBlocks).buildToObject()
//     : messageBuilder.buildToObject();
// };
describe('tests the message constructor', () => {
    describe('builds a test a default test report', () => {
        it('should construct a report for a failing build run', () => {
            const res = (0, messageConstructor_1.messageConstructor)({
                status: slack_1.cypressRunStatus['build:failed']
            });
            expect(res).toEqual({
                blocks: [
                    {
                        type: 'section'
                    },
                    {
                        type: 'divider'
                    },
                    {
                        elements: [
                            {
                                style: 'danger',
                                text: {
                                    text: 'Build Logs',
                                    type: 'plain_text'
                                },
                                type: 'button'
                            }
                        ],
                        type: 'actions'
                    }
                ]
            });
        });
        it('should construct a report for a passing test run', () => {
            const res = (0, messageConstructor_1.messageConstructor)({
                status: slack_1.cypressRunStatus['test:passed']
            });
            expect(res).toEqual({
                blocks: [
                    {
                        type: 'section'
                    },
                    {
                        type: 'divider'
                    },
                    {
                        elements: [
                            {
                                style: 'primary',
                                text: {
                                    text: 'Test Report',
                                    type: 'plain_text'
                                },
                                type: 'button'
                            },
                            {
                                style: 'primary',
                                text: {
                                    text: 'Build Logs',
                                    type: 'plain_text'
                                },
                                type: 'button'
                            }
                        ],
                        type: 'actions'
                    }
                ]
            });
        });
        it('should construct a report for a failing test run', () => {
            const res = (0, messageConstructor_1.messageConstructor)({
                status: slack_1.cypressRunStatus['test:failed']
            });
            expect(res).toEqual({
                blocks: [
                    {
                        type: 'section'
                    },
                    {
                        type: 'divider'
                    },
                    {
                        elements: [
                            {
                                style: 'danger',
                                text: {
                                    text: 'Test Report',
                                    type: 'plain_text'
                                },
                                type: 'button'
                            },
                            {
                                style: 'primary',
                                text: {
                                    text: 'Build Logs',
                                    type: 'plain_text'
                                },
                                type: 'button'
                            }
                        ],
                        type: 'actions'
                    }
                ]
            });
        });
    });
});
