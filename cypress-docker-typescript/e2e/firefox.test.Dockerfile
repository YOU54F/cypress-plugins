FROM cypressbasefirefox
RUN npm i cypress
RUN firefox --version
RUN $(npm bin)/cypress run --browser firefox