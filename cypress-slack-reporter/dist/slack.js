"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveCommitUrl = exports.resolveCIProvider = void 0;
const joinUrl = (base, ...components) => {
    const url = new URL(base.endsWith('/') ? base : `${base}/`);
    const suffix = components
        .filter(Boolean)
        .flatMap((component) => component.split('/'))
        .map((component) => encodeURIComponent(decodeURIComponent(component)))
        .join('/');
    url.pathname = `${url.pathname.replace(/\/+$/, '')}/${suffix}`.replace(/\/+$/, '');
    return url.toString();
};
const detectProvider = (env) => {
    if (env.GITHUB_ACTIONS === 'true' || env.GITHUB_RUN_ID)
        return 'github';
    if (env.GITLAB_CI === 'true' || (env.CI_PROJECT_URL && env.CI_JOB_URL)) {
        return 'gitlab';
    }
    if (env.BITBUCKET_BUILD_NUMBER)
        return 'bitbucket';
    if (env.CIRCLECI === 'true' || env.CIRCLE_SHA1)
        return 'circleci';
    if (env.JENKINS_HOME || env.BUILD_URL)
        return 'jenkins';
    return 'none';
};
const resolveCIProvider = (requestedProvider, env = process.env) => {
    var _a, _b, _c;
    const provider = requestedProvider === 'auto' ? detectProvider(env) : requestedProvider;
    switch (provider) {
        case 'github': {
            const repository = env.GITHUB_REPOSITORY;
            const serverUrl = env.GITHUB_SERVER_URL || 'https://github.com';
            const commitSha = env.GITHUB_SHA;
            const pullNumber = (_b = (_a = env.GITHUB_REF) === null || _a === void 0 ? void 0 : _a.match(/^refs\/pull\/(\d+)\//)) === null || _b === void 0 ? void 0 : _b[1];
            return {
                provider,
                repository,
                projectName: repository === null || repository === void 0 ? void 0 : repository.split('/').pop(),
                commitSha,
                commitUrl: repository && commitSha
                    ? joinUrl(serverUrl, repository, 'commit', commitSha)
                    : undefined,
                branch: env.GITHUB_HEAD_REF || env.GITHUB_REF_NAME,
                actor: env.GITHUB_ACTOR,
                buildUrl: repository && env.GITHUB_RUN_ID
                    ? joinUrl(serverUrl, repository, 'actions', 'runs', env.GITHUB_RUN_ID)
                    : undefined,
                pullRequestUrl: repository && pullNumber
                    ? joinUrl(serverUrl, repository, 'pull', pullNumber)
                    : undefined
            };
        }
        case 'gitlab': {
            const projectUrl = env.CI_PROJECT_URL;
            const commitSha = env.CI_COMMIT_SHA;
            const jobUrl = env.CI_JOB_URL;
            const mergeRequest = env.CI_MERGE_REQUEST_IID;
            return {
                provider,
                repository: env.CI_PROJECT_PATH,
                projectName: env.CI_PROJECT_NAME || env.CI_PROJECT_PATH,
                commitSha,
                commitUrl: projectUrl && commitSha
                    ? joinUrl(projectUrl, '-', 'commit', commitSha)
                    : undefined,
                branch: env.CI_COMMIT_REF_NAME,
                actor: env.GITLAB_USER_NAME,
                buildUrl: jobUrl,
                artifactBaseUrl: jobUrl
                    ? joinUrl(jobUrl, 'artifacts', 'file')
                    : undefined,
                pullRequestUrl: projectUrl && mergeRequest
                    ? joinUrl(projectUrl, '-', 'merge_requests', mergeRequest)
                    : undefined
            };
        }
        case 'bitbucket': {
            const repository = env.BITBUCKET_REPO_FULL_NAME;
            const baseUrl = 'https://bitbucket.org';
            const commitSha = env.BITBUCKET_COMMIT;
            return {
                provider,
                repository,
                projectName: repository === null || repository === void 0 ? void 0 : repository.split('/').pop(),
                commitSha,
                commitUrl: repository && commitSha
                    ? joinUrl(baseUrl, repository, 'commits', commitSha)
                    : undefined,
                branch: env.BITBUCKET_BRANCH,
                actor: env.BITBUCKET_STEP_TRIGGERER_UUID,
                buildUrl: repository && env.BITBUCKET_BUILD_NUMBER
                    ? `https://bitbucket.org/${repository}/addon/pipelines/home#!/results/${encodeURIComponent(env.BITBUCKET_BUILD_NUMBER)}`
                    : undefined,
                pullRequestUrl: repository && env.BITBUCKET_PR_ID
                    ? joinUrl(baseUrl, repository, 'pull-requests', env.BITBUCKET_PR_ID)
                    : undefined
            };
        }
        case 'circleci': {
            const repository = env.CIRCLE_PROJECT_USERNAME && env.CIRCLE_PROJECT_REPONAME
                ? `${env.CIRCLE_PROJECT_USERNAME}/${env.CIRCLE_PROJECT_REPONAME}`
                : undefined;
            const jobUrl = env.CIRCLE_BUILD_URL;
            return {
                provider,
                repository,
                projectName: env.CIRCLE_PROJECT_REPONAME,
                commitSha: env.CIRCLE_SHA1,
                commitUrl: repository && env.CIRCLE_SHA1
                    ? joinUrl('https://github.com', repository, 'commit', env.CIRCLE_SHA1)
                    : undefined,
                branch: env.CIRCLE_BRANCH,
                actor: env.CIRCLE_USERNAME,
                buildUrl: jobUrl,
                artifactBaseUrl: env.CIRCLE_WORKFLOW_JOB_ID
                    ? `https://output.circle-artifacts.com/output/job/${env.CIRCLE_WORKFLOW_JOB_ID}/artifacts/0`
                    : undefined,
                pullRequestUrl: env.CIRCLE_PULL_REQUEST
            };
        }
        case 'jenkins': {
            const repositoryUrl = (_c = env.GIT_URL) === null || _c === void 0 ? void 0 : _c.replace(/\.git$/, '');
            const commitSha = env.GIT_COMMIT;
            return {
                provider,
                projectName: env.JOB_NAME,
                repository: repositoryUrl,
                commitSha,
                commitUrl: repositoryUrl && commitSha
                    ? joinUrl(repositoryUrl, 'commit', commitSha)
                    : undefined,
                branch: env.BRANCH_NAME,
                actor: env.CHANGE_AUTHOR,
                buildUrl: env.BUILD_URL
            };
        }
        case 'custom':
            return {
                provider,
                projectName: env.CI_PROJECT_REPONAME,
                repository: env.CI_PROJECT_URL,
                commitSha: env.CI_SHA1,
                branch: env.CI_BRANCH,
                actor: env.CI_USERNAME,
                buildUrl: env.CI_BUILD_URL,
                artifactBaseUrl: env.CI_JOB_URL
                    ? joinUrl(env.CI_JOB_URL, 'artifacts', 'file')
                    : undefined,
                pullRequestUrl: env.CI_PULL_REQUEST
            };
        case 'none':
            return { provider };
        default: {
            const exhaustive = provider;
            throw new Error(`Unsupported CI provider: ${exhaustive}`);
        }
    }
};
exports.resolveCIProvider = resolveCIProvider;
const resolveCommitUrl = (requestedProvider, context, env = process.env) => {
    const provider = requestedProvider === 'auto' ? context.provider : requestedProvider;
    const repository = provider === 'gitlab'
        ? env.CI_PROJECT_URL
        : provider === 'github'
            ? env.GITHUB_REPOSITORY
            : provider === 'bitbucket'
                ? env.BITBUCKET_REPO_FULL_NAME
                : undefined;
    const commitSha = provider === 'gitlab'
        ? env.CI_COMMIT_SHA
        : provider === 'github'
            ? env.GITHUB_SHA
            : provider === 'bitbucket'
                ? env.BITBUCKET_COMMIT
                : context.commitSha;
    if (provider === 'none')
        return undefined;
    if (provider === 'custom')
        return context.commitUrl;
    if (!repository || !commitSha)
        return context.commitUrl;
    if (provider === 'gitlab') {
        return joinUrl(repository, '-', 'commit', commitSha);
    }
    if (provider === 'github') {
        return joinUrl(env.GITHUB_SERVER_URL || 'https://github.com', repository, 'commit', commitSha);
    }
    if (provider === 'bitbucket') {
        return joinUrl(env.BITBUCKET_GIT_HTTP_ORIGIN || 'https://bitbucket.org', repository, 'commits', commitSha);
    }
    return context.commitUrl;
};
exports.resolveCommitUrl = resolveCommitUrl;
