DIST_PATH=./dist
DOCKERNAME ?= zbox-oauth2:latest

clean:
	@echo Cleaning up
	@rm -Rf $(DIST_PATH)

build: clean
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

	@echo Installind dependancies
	@cd $(DIST_PATH) && npm install --production

docker: build
	@echo Building Docker Image
	@docker build -t enahum/${DOCKERNAME} -f Dockerfile .
	@rm -rf $(DIST_PATH)