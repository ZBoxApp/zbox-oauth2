.PHONY: clean build docker configure

ESLINT=node_modules/.bin/eslint
DIST_PATH=./dist
DOCKERNAME ?= zbox-oauth2
BUILD_NUMBER ?= dev

clean:
	@echo Cleaning up
	@rm -Rf $(DIST_PATH)

configure: clean
	@echo Installing NPM dependencies
	@npm install

	@echo Installing Bower dependencies
	@bower install

	@echo Running ESLint
	@$(ESLINT) --ext=".js" --ignore_pattern=node_modules --quiet .

	@echo Preparing bundles
	@gulp


build: clean configure
	@echo Building ZBoxOAuth Service
	@mkdir -p $(DIST_PATH)
	@cp -RL ./bin $(DIST_PATH)/bin
	@mkdir -p $(DIST_PATH)/config
	@cp -RL ./config/production.json $(DIST_PATH)/config
	@cp -RL ./controllers $(DIST_PATH)/controllers
	@cp -RL ./libs $(DIST_PATH)/libs
	@mkdir -p $(DIST_PATH)/logs
	@cp -RL ./models $(DIST_PATH)/models
	@mkdir -p $(DIST_PATH)/public
	@cp -RL ./public/css $(DIST_PATH)/public/css
	@cp -RL ./public/images $(DIST_PATH)/public/images
	@cp -RL ./public/js $(DIST_PATH)/public/js
	@cp -RL ./public/plugins $(DIST_PATH)/public/plugins
	@cp -RL ./routes $(DIST_PATH)/routes
	@cp -RL ./views $(DIST_PATH)/views
	@cp ./se*.js $(DIST_PATH)
	@cp package.json $(DIST_PATH)

	@echo Installing dependancies
	@cd $(DIST_PATH) && npm install --production

docker: build
	@echo Building Docker Image fro Production
ifeq ($(BUILD_NUMBER), dev)
	$(eval BUILD_NUMBER := $(shell read -p "Enter the version number:" version; echo $$version))
endif

	@echo BUILD_NUMBER IS ${DOCKERNAME}:${BUILD_NUMBER}
	@docker build -t enahum/${DOCKERNAME}:$(BUILD_NUMBER) -f docker/prod/Dockerfile .
	@rm -rf $(DIST_PATH)
	@docker tag -f enahum/${DOCKERNAME}:$(BUILD_NUMBER) enahum/${DOCKERNAME}:latest

docker-dev: build
	@echo Building Docker Image for Dev

	@echo BUILD_NUMBER IS ${DOCKERNAME}:dev
	@docker build -t enahum/${DOCKERNAME}:dev -f docker/test/Dockerfile .
	@rm -rf $(DIST_PATH)