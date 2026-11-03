
# Cypress-Edge -  NOW ARCHIVED AS CYPRESS SUPPORTS THIS NATIVELY AND CHROMIUM EDGE HAS BEEN RELEASED PUBLICLY


[![CircleCI](https://circleci.com/gh/YOU54F/cypress-edge/tree/master.svg?style=svg)](https://circleci.com/gh/YOU54F/cypress-edge/tree/master)

Following on my blog post
[The new Chromium-based Microsoft Edge for Mac has been leaked — And it works with Cypress.](https://blog.you54f.com/2019/05/15/the-new-chromium-based-microsoft-edge-for-mac-has-been-leaked%e2%80%8a-%e2%80%8aand-it-works-with-cypress/)

I have released versions that you can test out yourself :)

<img width="807" alt="Screenshot 2019-05-14 at 22 59 28" src="https://user-images.githubusercontent.com/19932401/57735839-e080ef00-769d-11e9-9317-f154b4463bff.png">
<img width="1208" alt="Screenshot 2019-05-14 at 23 11 03" src="https://user-images.githubusercontent.com/19932401/57735840-e080ef00-769d-11e9-885a-c97cf753a08e.png">

## TL;DR

_macosx only atm_

1. Download Microsoft Edge for Mac (Canary Build) for MacOS [here](https://officecdn.microsoft.com/pr/C1297A47-86C4-4C1F-97FA-950631F94777/MacAutoupdate/MicrosoftEdgeCanary-76.0.151.0.pkg)
2. Make a new directory
3. Run `export CYPRESS_INSTALL_BINARY=https://github.com/YOU54F/cypress/releases/download/v3.2.0-edge.1/3.2.0-edge.1.zip`
4. Run `npm init`
5. Run `npm install @you54f/cypress --save`
6. Run `node_modules/.bin/cypress open --browser edge` to open in interactive mode, and setup [Cypress.io](https://cypress.io)'s example project
7. Run `node_modules/.bin/cypress run --browser edge` to run in command line mode.
8. Rejoice & please pass back some appreciation with a star on the repository! Thanks :)

## Proposal for Microsoft Edge (Chromium Based) Support in Cypress

Official Microsoft Edge Insiders page [here](https://www.microsoftedgeinsider.com/en-us/)

Currently tested

- [x] Microsoft Edge for Mac (Canary Build)
  - Binary package [here](https://officecdn.microsoft.com/pr/C1297A47-86C4-4C1F-97FA-950631F94777/MacAutoupdate/MicrosoftEdgeCanary-76.0.151.0.pkg)
  - [X] Passing against CircleCI / MacOS Executor
- [X] Microsoft Edge for Mac (Dev Build)
  - Binary package [here](https://officecdn.microsoft.com/pr/C1297A47-86C4-4C1F-97FA-950631F94777/MacAutoupdate/MicrosoftEdgeDev-76.0.151.0.pkg)
  - [X] Passing against CircleCI / MacOS Executor
- [ ] Microsoft Edge for Windows 10 (Canary Build)
  - Binary package [here](https://c2rsetup.officeapps.live.com/c2r/downloadEdge.aspx?ProductreleaseID=Edge&platform=Default&version=Edge&Channel=Canary&language=en-us&Consent=1&IID=fe1b2a91-d63d-532d-ac23-eaad1e276343)
- [ ] Microsoft Edge for Windows 10 (Dev Build) 
  - Binary package [here](https://c2rsetup.officeapps.live.com/c2r/downloadEdge.aspx?ProductreleaseID=Edge&platform=Default&version=Edge&Channel=Dev&language=en-us&Consent=0&IID=fe1b2a91-d63d-532d-ac23-eaad1e276343)
- [ ] Microsoft Edge for Linux (Canary Build)
  - Binary package currently unavalable
- [ ] Microsoft Edge for Linux (Dev Build)
  - Binary package currently unavalable

## Installation instructions for Mac OSX / Edge Canary

Support for testing with Microsoft Edge (Beta) & Cypress

Download Microsoft Edge for Mac (Canary Build) for MacOS [here](https://officecdn.microsoft.com/pr/C1297A47-86C4-4C1F-97FA-950631F94777/MacAutoupdate/MicrosoftEdgeCanary-76.0.151.0.pkg)

Bare url

```sh
https://officecdn.microsoft.com/pr/C1297A47-86C4-4C1F-97FA-950631F94777/MacAutoupdate/MicrosoftEdgeCanary-76.0.151.0.pkg

```

Add `CYPRESS_INSTALL_BINARY` env var override, to download the forked cypress binary.

```sh
export CYPRESS_INSTALL_BINARY=https://github.com/YOU54F/cypress/releases/download/v3.3.0/cypress.zip
```

Install this fork, as a published npm module

```sh
npm install @you54f/cypress --save
```

Run Cypress, select Edge from Browser list, test and report issues to Cypress or on here 👍

```sh
➜  cypress-edge git:(master) ✗ export CYPRESS_INSTALL_BINARY=https://github.com/YOU54F/cypress/releases/download/v3.3.0/cypress.zip
➜  cypress-edge git:(master) ✗ npm install @you54f/cypress --save

> @you54f/cypress@3.2.0-edge.1 postinstall /Users/you54f/dev/saftest/githubrepos/cypress-edge/node_modules/@you54f/cypress
> node index.js --exec install

⚠ Warning: Forcing a binary version different than the default.

  The CLI expected to install version: 3.2.0-edge.1

  Instead we will install version: https://github.com/YOU54F/cypress/releases/download/v3.2.0-edge.1/cypress-3.2.0-edge.1.zip

  These versions may not work properly together.

Installing Cypress (version: https://github.com/YOU54F/cypress/releases/download/v3.2.0-edge.1/cypress-3.2.0-edge.1.zip)

 ✔  Downloaded Cypress
 ✔  Unzipped Cypress
 ✔  Finished Installation /Users/you54f/Library/Caches/Cypress/3.2.0-edge.1

You can now open Cypress by running: node_modules/.bin/cypress open

https://on.cypress.io/installing-cypress

npm WARN cypress-edge@1.0.0 No description
npm WARN cypress-edge@1.0.0 No repository field.

+ @you54f/cypress@3.2.0-edge.1
added 189 packages from 124 contributors and audited 329 packages in 30.078s
found 0 vulnerabilities

➜  cypress-edge git:(master) ✗ node_modules/.bin/cypress run --browser edeg
It looks like this is your first time using Cypress: 3.2.0-edge.1

 ✔  Verified Cypress! /Users/you54f/Library/Caches/Cypress/3.2.0-edge.1/Cypress.app

Opening Cypress...
Can't run because you've entered an invalid browser name.

Browser: 'edeg' was not found on your system.

Available browsers found are: chrome, edge, electron
➜  cypress-edge git:(master) ✗ node_modules/.bin/cypress run --browser edge

====================================================================================================

  (Run Starting)

  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Cypress:    3.2.0-edge.1                                                                       │
  │ Browser:    Edge 76                                                                            │
  │ Specs:      19 found (examples/actions.spec.js, examples/aliasing.spec.js, examples/assertion… │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘


────────────────────────────────────────────────────────────────────────────────────────────────────

  Running: examples/actions.spec.js...                                                    (1 of 19)

Warning: Cypress can only record videos when using the built in 'electron' browser.

You have set the browser to: 'edge'

A video will not be recorded when using this browser.


  Actions
    ✓ .type() - type into a DOM element (4321ms)
    ✓ .focus() - focus on a DOM element (206ms)
    ✓ .blur() - blur off a DOM element (455ms)
    ✓ .clear() - clears an input or textarea element (578ms)
    ✓ .submit() - submit a form (459ms)
    ✓ .click() - click on a DOM element (2031ms)
    ✓ .dblclick() - double click on a DOM element (250ms)
    ✓ .check() - check a checkbox or radio element (891ms)
    ✓ .uncheck() - uncheck a checkbox element (903ms)
    ✓ .select() - select an option in a <select> element (933ms)
    ✓ .scrollIntoView() - scroll an element into view (211ms)
    ✓ .trigger() - trigger an event on a DOM element (185ms)
    ✓ cy.scrollTo() - scroll the window or element to a position (2155ms)


  13 passing (15s)


  (Results)

  ┌────────────────────────────────────────┐
  │ Tests:        13                       │
  │ Passing:      13                       │
  │ Failing:      0                        │
  │ Pending:      0                        │
  │ Skipped:      0                        │
  │ Screenshots:  0                        │
  │ Video:        false                    │
  │ Duration:     14 seconds               │
  │ Spec Ran:     examples/actions.spec.js │
  └────────────────────────────────────────┘


────────────────────────────────────────────────────────────────────────────────────────────────────

*** Output omitted due to allow readers sanity to remain intacts ***
────────────────────────────────────────────────────────────────────────────────────────────────────

  Running: examples/window.spec.js...                                                    (19 of 19)

Warning: Cypress can only record videos when using the built in 'electron' browser.

You have set the browser to: 'edge'

A video will not be recorded when using this browser.


  Window
    ✓ cy.window() - get the global window object (204ms)
    ✓ cy.document() - get the document object (153ms)
    ✓ cy.title() - get the title (126ms)


  3 passing (2s)


  (Results)

  ┌───────────────────────────────────────┐
  │ Tests:        3                       │
  │ Passing:      3                       │
  │ Failing:      0                       │
  │ Pending:      0                       │
  │ Skipped:      0                       │
  │ Screenshots:  0                       │
  │ Video:        false                   │
  │ Duration:     1 second                │
  │ Spec Ran:     examples/window.spec.js │
  └───────────────────────────────────────┘


====================================================================================================

  (Run Finished)


      Spec                                                Tests  Passing  Failing  Pending  Skipped
  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ ✔ examples/actions.spec.js                  00:14       13       13        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔ examples/aliasing.spec.js                 00:02        2        2        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔ examples/assertions.spec.js               00:02        8        8        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔ examples/connectors.spec.js               00:02        5        5        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔ examples/cookies.spec.js                  00:02        5        5        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔ examples/cypress_api.spec.js              00:03       13       13        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔ examples/files.spec.js                    00:02        4        4        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔ examples/local_storage.spec.js            00:01        1        1        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔ examples/location.spec.js                 00:01        3        3        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔ examples/misc.spec.js                     00:17        6        6        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔ examples/navigation.spec.js               00:03        3        3        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔ examples/network_requests.spec.js         00:04        5        5        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔ examples/querying.spec.js                 00:02        4        4        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔ examples/spies_stubs_clocks.spec.js       00:02        4        4        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔ examples/traversal.spec.js                00:05       18       18        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔ examples/utilities.spec.js                00:04        6        6        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔ examples/viewport.spec.js                 00:04        1        1        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔ examples/waiting.spec.js                  00:06        2        2        -        -        - │
  ├────────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ✔ examples/window.spec.js                   00:01        3        3        -        -        - │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘
    All specs passed!                           01:26      106      106        -        -        -
```
