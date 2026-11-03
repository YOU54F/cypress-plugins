import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  expandCustomText,
  findArtifactLinks,
  messageConstructor,
  parseMochawesomeStats
} from './index';
import { resolveCIProvider, resolveCommitUrl } from './slack';
import { resolveWebhookUrls } from './slackClient';

describe('Mochawesome report status', () => {
  it('counts pending tests as skipped and treats an all-skipped run as passed', () => {
    expect(
      parseMochawesomeStats({
        stats: { tests: 3, passes: 0, failures: 0, pending: 3, duration: 10 }
      })
    ).toEqual({
      totalTests: 3,
      totalPasses: 0,
      totalFailures: 0,
      totalSkipped: 3,
      totalDuration: 10,
      status: 'test:passed'
    });

  });

  it('exports the message constructor for programmatic use', () => {
    expect(typeof messageConstructor).toBe('function');
  });
});

describe('CI providers', () => {
  it('creates GitHub Actions build and commit links', () => {
    const context = resolveCIProvider('github', {
      GITHUB_REPOSITORY: 'owner/project',
      GITHUB_SERVER_URL: 'https://github.example.test',
      GITHUB_SHA: 'abc123',
      GITHUB_RUN_ID: '99',
      GITHUB_REF: 'refs/pull/42/merge'
    });

    expect(context.buildUrl).toBe(
      'https://github.example.test/owner/project/actions/runs/99'
    );
    expect(context.commitUrl).toBe(
      'https://github.example.test/owner/project/commit/abc123'
    );
    expect(context.pullRequestUrl).toBe(
      'https://github.example.test/owner/project/pull/42'
    );
  });

  it('supports GitLab self-managed commit and artifact URLs', () => {
    const env = {
      CI_PROJECT_URL: 'https://gitlab.example.test/team/project',
      CI_PROJECT_PATH: 'team/project',
      CI_COMMIT_SHA: 'abc123',
      CI_COMMIT_REF_NAME: 'main',
      CI_JOB_URL: 'https://gitlab.example.test/team/project/-/jobs/99',
      CI_MERGE_REQUEST_IID: '17'
    };
    const context = resolveCIProvider('gitlab', env);

    expect(context.commitUrl).toBe(
      'https://gitlab.example.test/team/project/-/commit/abc123'
    );
    expect(context.artifactBaseUrl).toBe(
      'https://gitlab.example.test/team/project/-/jobs/99/artifacts/file'
    );
    expect(context.pullRequestUrl).toBe(
      'https://gitlab.example.test/team/project/-/merge_requests/17'
    );
    expect(resolveCommitUrl('gitlab', context, env)).toBe(context.commitUrl);
  });

  it('auto-detects GitLab CI on a self-managed host', () => {
    expect(
      resolveCIProvider('auto', {
        GITLAB_CI: 'true',
        CI_PROJECT_URL: 'https://gitlab.example.test/team/project',
        CI_JOB_URL: 'https://gitlab.example.test/team/project/-/jobs/99'
      }).provider
    ).toBe('gitlab');
  });
});

describe('custom text and artifact links', () => {
  it('expands environment variables and escaped newlines', () => {
    expect(
      expandCustomText('Job: $CI_JOB_URL\\nDone', {
        CI_JOB_URL: 'https://gitlab.example.test/job/1'
      })
    ).toBe('Job: https://gitlab.example.test/job/1\nDone');
  });

  it('links screenshots when given a GitLab artifact URL', async () => {
    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'slack-reporter-'));
    const screenshotDir = path.join(cwd, 'cypress/screenshots');
    fs.mkdirSync(screenshotDir, { recursive: true });
    fs.writeFileSync(path.join(screenshotDir, 'image one.png'), '');

    try {
      const links = await findArtifactLinks(
        'https://gitlab.example.test/team/project/-/jobs/99/artifacts/file/cypress/screenshots',
        'png',
        'Screenshot',
        cwd
      );

      expect(links).toEqual([
        '<https://gitlab.example.test/team/project/-/jobs/99/artifacts/file/cypress/screenshots/image%20one.png|Screenshot: image one.png>'
      ]);

      const localArtifactLinks = await findArtifactLinks(
        'artifacts/file/cypress/screenshots',
        'png',
        'Screenshot',
        cwd,
        'https://gitlab.example.test/team/project/-/jobs/99/artifacts/file'
      );
      expect(localArtifactLinks).toEqual(links);
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true });
    }
  });

  it('routes webhook messages to the matching status destination', () => {
    const env = {
      SLACK_WEBHOOK_URL: 'https://hooks.test/default',
      SLACK_WEBHOOK_PASSED_URL: 'https://hooks.test/passed',
      SLACK_WEBHOOK_FAILED_URL: 'https://hooks.test/failed',
      SLACK_WEBHOOK_ERROR_URL: 'https://hooks.test/error'
    };

    expect(resolveWebhookUrls('test:passed', env)).toEqual([
      'https://hooks.test/passed'
    ]);
    expect(resolveWebhookUrls('test:failed', env)).toEqual([
      'https://hooks.test/failed'
    ]);
    expect(resolveWebhookUrls('build:failed', env)).toEqual([
      'https://hooks.test/error'
    ]);
  });
});
