# cypress-plugins

Various cypress plugins, some of which I've created, some I've adopted. 

It's easier for me to have them all in one place.

- `cypress-multi-reporters` - Use multiple reporters in your tests

## Archived projects

Projects not currently being maintained are in [archive/](./archive/). They
remain in the repository for reference and may be revisited later.

## Documentation

- `cypress-plugins-site` - The website, built with Docusaurus V2 and deployed via Vercel

## Releases

Maintained npm packages are versioned independently with
[Release Please](https://github.com/googleapis/release-please). Conventional
commits on `master` produce a release PR with a package-specific version and
`CHANGELOG.md`. Merging that PR creates package-prefixed GitHub releases and
publishes only the packages included in that release.

The current release manifest includes `cypress-multi-reporters`. The replacement
Slack reporter will be added to the release manifest with its v2 source.
Archived projects are not released by this workflow.

## Example

The archived `cypress-docker-typescript` scaffolded example generated a project with the following.

It contains

- `Typescript`
- The `Cypress` GUI tool
- The `Cypress` CLI tool
- `CircleCI` / `GitHub Actions` workflows 
- `cypress-mochawesome-reporter` for fancy test reports
- `cypress-slack-reporter` for upload your reports to slck
- `cypress-failed-logs` devTools console log output on test fail
- Easy to wire up with Cypress' Dashboard Service for project recording
- `Dockerfile` to self contain the application and require no pre-requisites on the host machine, bar `Docker`.