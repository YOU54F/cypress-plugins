import fs from 'fs';
import os from 'os';
import path from 'path';
import { runReporter } from './index';
import { sendSlackMessage } from './slackClient';

jest.mock('./slackClient', () => ({
  sendSlackMessage: jest.fn().mockResolvedValue(undefined)
}));

describe('runReporter programmatic blocks', () => {
  it('builds custom blocks from report stats and CI context', async () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'slack-reporter-report-'));
    const reportDirectory = path.join(cwd, 'reports');
    fs.mkdirSync(reportDirectory);
    fs.writeFileSync(
      path.join(reportDirectory, 'report.json'),
      JSON.stringify({
        stats: { tests: 3, passes: 2, failures: 0, pending: 1, duration: 10 }
      })
    );

    try {
      await runReporter(
        {
          ciProvider: 'none',
          vcsProvider: 'none',
          reportDir: reportDirectory,
          customBlocks: (stats, context) => [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `Skipped ${stats.totalSkipped}; CI ${context.provider}`
              }
            }
          ]
        },
        {}
      );

      const message = jest.mocked(sendSlackMessage).mock.calls[0][0];
      expect(message.blocks?.[message.blocks.length - 1]).toEqual({
        type: 'section',
        text: { type: 'mrkdwn', text: 'Skipped 1; CI none' }
      });
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  });
});
