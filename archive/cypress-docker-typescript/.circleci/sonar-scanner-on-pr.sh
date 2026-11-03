if [[ ((`echo $CIRCLE_PULL_REQUEST | grep -c "pull"` > 0))]]; then 
      GIT_PR_NUMBER=$(echo ${CIRCLE_PULL_REQUEST} | sed 's#.*/##' ) &&          
      ~/app/e2e/node_modules/.bin/sonar-scanner \
      -Dsonar.host.url=https://sonarcloud.io \
      -Dsonar.projectKey=$SONAR_PROJECTKEY \
      -Dsonar.organization=$SONAR_ORGANIZATION \
      -Dsonar.sources=. \
      -Dsonar.login=$SONAR_LOGIN \
      -Dsonar.pullrequest.base=master \
      -Dsonar.pullrequest.branch=${CIRCLE_BRANCH} \
      -Dsonar.pullrequest.key=${GIT_PR_NUMBER} \
      -Dsonar.pullrequest.provider=github \
      -Dsonar.pullrequest.github.repository=${CIRCLE_PROJECT_REPONAME}/${CIRCLE_PROJECT_USERNAME} \
      -Dsonar.pullrequest.github.endpoint=https://api.github.com/ \
      -Dsonar.pullrequest.github.token.secured=$SONAR_GITHUB_TOKEN
fi