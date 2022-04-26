FROM cypress/browsers:chrome69

# versions of local tools
RUN node -v \ 
yarn -v \
	yarn -v \
	google-chrome --version \
	git --version

ENV TERM xterm

WORKDIR /app

COPY / /app

RUN yarn install
