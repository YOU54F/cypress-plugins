CYPRESSRUNCMD=npx cypress run
CYPRESSGUICMD=npx cypress open

test:
	$(CYPRESSRUNCMD)
	
test-gui:
	$(CYPRESSGUICMD)

combine-reports:
	mkdir mochareports && npx mochawesome-merge --reportDir cypress/reports/mocha > mochareports/report-$$(date +'%Y%m%d-%H%M%S').json

generate-report:
	npx marge mochareports/*.json -f report-$$(date +'%Y%m%d-%H%M%S') -o mochareports

slack-alert:
	npx ts-node src/slack/index.ts --report-dir test/reportSingle --video-dir test/videosDirPopulated --screenshot-dir test/screenshotsDirPopulated --logger

slack-alert-js:
	npx node dist/index.js --logger