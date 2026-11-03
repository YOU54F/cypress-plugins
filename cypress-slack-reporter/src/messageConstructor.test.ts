import { messageConstructor } from './messageConstructor';

describe('messageConstructor', () => {
  it('includes skipped tests and links to the report and build', () => {
    const message = messageConstructor({
      status: 'test:failed',
      projectName: 'shop',
      branch: 'main',
      totalTests: 10,
      totalPasses: 6,
      totalFailures: 2,
      totalSkipped: 2,
      reportUrl: 'https://example.test/report.html',
      buildUrl: 'https://example.test/build',
      customBlocks: [
        {
          type: 'section',
          text: { type: 'mrkdwn', text: '*Customer-defined block*' }
        }
      ]
    });

    expect(message.text).toBe('shop test run failed');
    expect(message.blocks).toContainEqual(
      expect.objectContaining({
        type: 'section',
        fields: expect.arrayContaining([
          expect.objectContaining({ text: '*Skipped:*\n2' })
        ])
      })
    );
    expect(message.blocks).toContainEqual(
      expect.objectContaining({
        type: 'actions',
        elements: expect.arrayContaining([
          expect.objectContaining({
            text: { type: 'plain_text', text: 'Test Report' },
            url: 'https://example.test/report.html'
          })
        ])
      })
    );
    expect(message.blocks?.[message.blocks.length - 1]).toEqual({
      type: 'section',
      text: { type: 'mrkdwn', text: '*Customer-defined block*' }
    });
  });

  it("rejects custom blocks that exceed Slack's block limit", () => {
    expect(() =>
      messageConstructor({
        status: 'test:passed',
        totalTests: 1,
        totalPasses: 1,
        totalFailures: 0,
        totalSkipped: 0,
        customBlocks: Array.from({ length: 49 }, () => ({ type: 'divider' }))
      })
    ).toThrow('Slack messages support at most 50 blocks');
  });
});
