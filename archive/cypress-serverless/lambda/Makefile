pre:
	npm i

build:
		docker build . -t cypress-lambda

extract_deps:
		./deps.sh

test:
		docker run --rm -v "lambda":/var/task:ro lambci/lambda:nodejs8.10

deploy:
	touch lambda.zip
	terraform init
	terraform apply --auto-approve 