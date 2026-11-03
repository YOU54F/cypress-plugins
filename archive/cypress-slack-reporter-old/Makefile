CYPRESSRUNCMD=npx cypress run
CYPRESSGUICMD=npx cypress open

test:
	$(CYPRESSRUNCMD)

test-record:
	$(CYPRESSRUNCMD) --record
	
test-gui:
	$(CYPRESSGUICMD)

combine-reports:
	mkdir mochareports && npx mochawesome-merge cypress/reports/mocha/*.json > mochareports/report-$$(date +'%Y%m%d-%H%M%S').json

generate-report:
	npx marge mochareports/*.json -f report-$$(date +'%Y%m%d-%H%M%S') -o mochareports

slack-alert:
	npx ts-node src/index.ts --report-dir test/reportSingle --video-dir test/videosDirPopulated --screenshot-dir test/screenshotsDirPopulated --verbose

slack-alert-js:
	node bin/index.js --verbose