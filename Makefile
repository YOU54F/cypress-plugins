CYPRESSRUNCMD=npx cypress run
CYPRESSGUICMD=npx cypress open

test:
	$(CYPRESSRUNCMD)
	
test-gui:
	$(CYPRESSGUICMD)

test-local:
	$(CYPRESSRUNCMD) --env configFile=development

test-qa:
	$(CYPRESSRUNCMD) --env configFile=qa

test-staging:
	$(CYPRESSRUNCMD) --env configFile=staging

test-production:
	$(CYPRESSRUNCMD) --env configFile=production

test-local-gui:
	$(CYPRESSGUICMD) --env configFile=development

test-qa-gui:
	$(CYPRESSGUICMD) --env configFile=qa

test-record:
	$(CYPRESSRUNCMD) --record

combine-reports:
	npx mochawesome-merge --reportDir cypress/reports/mocha > mochareports/report-$$(date +'%Y%m%d-%H%M%S').json

generate-report:
	npx marge mochareports/*.json -f report-$$(date +'%Y%m%d-%H%M%S') -o mochareports

slack-alert:
	npx ts-node scripts/slack/slack-alert.ts