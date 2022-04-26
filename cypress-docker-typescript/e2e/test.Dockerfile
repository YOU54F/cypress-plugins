FROM cypressbaseelectron
RUN npm i cypress
RUN $(npm bin)/cypress run