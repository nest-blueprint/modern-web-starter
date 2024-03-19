include .env

DATE=`date +%Y-%d-%m-%H:%M:%S`
DIR := ${CURDIR}
PREVIOUS_TAG := $(shell git describe --tags --abbrev=0 @^)
EXEC_NPX = docker compose exec -T api npx
EXEC_CUCUMBER = docker compose exec -T api ./node_modules/@cucumber/cucumber/bin/cucumber-js
EXEC_TS_NODE = docker compose exec -T api npx ts-node

.env: .env.local
	[ -f .env ] || cp .env.local .env
###
# application
###
start: \
	docker-start

###
# docker
###
docker-start:
	docker-compose up -d

docker-stop:
	docker-compose down -v

###
# test
###
test:
	$(EXEC_NPX) jest --verbose

unit-test:
	$(EXEC_NPX) jest --verbose ./module/core/test/unit

integration-test:
	$(EXEC_NPX) jest --verbose --config=./jest.config.integration.ts --runInBand

feature-test:
	$(EXEC_CUCUMBER)  -p default --fail-fast

###
# build
###
build:
	$(EXEC_NPX) rimraf dist && $(EXEC_NPX) nest build


###
# development
###
format:
	$(EXEC_NPX) prettier --write "{module,config,public}/**/*.ts" "test/**/*.ts"

lint:
	$(EXEC_NPX) eslint "{module,config,public}/**/*.ts" --fix


###
# sequelize
###
db-migrate:
	$(EXEC_TS_NODE) node_modules/.bin/sequelize db:migrate

db-init:
	$(EXEC_TS_NODE) ./config/sequelize/init.sequelize.ts

db-seed:
	ts-node ./config/sequelize/seed.sequelize.ts