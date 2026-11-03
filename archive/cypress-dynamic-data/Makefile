DOCKERIMGNAME=cypresstestdocker
DOCKERRUNCMD=docker-compose run --rm $(DOCKERIMGNAME)
CYPRESSRUNCMD=npx cypress run
CYPRESSGUICMD=npx cypress open
SPECS=--spec "**/*.*"

test-gui:
	$(CYPRESSGUICMD)

test-local:
	$(CYPRESSRUNCMD) --env configFile=development $(SPECS)

test-qa:
	$(CYPRESSRUNCMD) --env configFile=qa $(SPECS)

test-staging:
	$(CYPRESSRUNCMD) --env configFile=staging $(SPECS)

test-production:
	$(CYPRESSRUNCMD) --env configFile=production $(SPECS)

test-local-gui:
	$(CYPRESSGUICMD) --env configFile=development

test-qa-gui:
	$(CYPRESSGUICMD) --env configFile=qa

test-staging-gui:
	$(CYPRESSGUICMD) --env configFile=staging

test-record:
	$(CYPRESSRUNCMD) --record $(SPECS)

docker-build:
	docker build . -t $(DOCKERIMGNAME)

docker-bash:
	$(DOCKERRUNCMD) /bin/bash

docker-test:
	$(DOCKERRUNCMD) $(CYPRESSRUNCMD) $(SPECS)

docker-test-local:
	$(DOCKERRUNCMD) $(CYPRESSRUNCMD) --env configFile=development $(SPECS)

docker-test-qa:
	$(DOCKERRUNCMD) $(CYPRESSRUNCMD) --env configFile=qa $(SPECS)

docker-test-staging:
	$(DOCKERRUNCMD) $(CYPRESSRUNCMD) --env configFile=staging $(SPECS)

docker-test-production:
	$(DOCKERRUNCMD) $(CYPRESSRUNCMD) --env configFile=production $(SPECS)

docker-test-record:
	$(DOCKERRUNCMD) $(CYPRESSRUNCMD) --record $(SPECS)

slack-alert:
	npx cypress-slack-reporter --vcs-provider bitbucket

combine-reports:
	npx mochawesome-merge --reportDir cypress/reports/mocha > mochareports/report-$$(date +'%Y%m%d-%H%M%S').json

generate-report:
	npx marge mochareports/*.json -f report-$$(date +'%Y%m%d-%H%M%S') -o mochareports
	
circle-ci-qa:
	$(CYPRESSRUNCMD) --env configFile=qa -s 'cypress/integration/**/*' 

circle-ci-staging:
	$(CYPRESSRUNCMD) --env configFile=staging -s 'cypress/integration/**/*' 

convertCSVtoJSON:
	npx ts-node testData/convertCSVtoJSON.ts

convertXLStoJSON:
	npx ts-node testData/convertXLStoJSON.ts