FROM cypressbasechrome
RUN npm i cypress
RUN google-chrome --version
RUN $(npm bin)/cypress run --browser chrome
