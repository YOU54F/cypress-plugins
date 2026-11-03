# cypress-circleorbtest

An example repo to show

- CircleCI integration with Cypress Orbs
- Mochawesome for fancy HTML reporting with `mochawesome`
- Mochawesome report merging with `mochawesome-merge`
- Slack reporting with `cypress-slack-reporter`

Ensure post steps are set to run always, otherwise they will not run when a Cypress test fails

```
version: 2.1
orbs:
  cypress: cypress-io/cypress@1.7.0

workflows:
  build:
    jobs:
      - cypress/run:
          post-steps:
            - run: 
                when: always
                name: Merge MochaAwesome Reports
                command: npx mochawesome-merge cypress/reports/mocha/*.json > mochareports/report.json 
            - run: 
                when: always
                name: Create mochawesome html report
                command: npx marge mochareports/*.json -f report -o mochareports
            - run:
                when: always
                name: Slack report
                command: npx cypress-slack-reporter --verbose
            - store_artifacts:
                path: mochareports
            - store_test_results:
                path: cypress/reports
```
