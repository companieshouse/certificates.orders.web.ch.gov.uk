artifact_name       := certificates.orders.web.ch.gov.uk

.PHONY: build
build: clean init submodules build-app

.PHONY: submodules
submodules:
	git submodule init
	git submodule update

.PHONY: build-app
build-app:
	npm run build

.PHONY: clean
clean:
	rm -rf dist/

.PHONY: npm-install
npm-install:
	npm i

.PHONY: gulp-install
gulp-install:
	npm install gulp-cli -g

.PHONY: init
init: npm-install gulp-install

.PHONY: test
test: test-unit

.PHONY: test-unit
test-unit:
	npm run test:coverage

.PHONY: lint
lint:
	npm i lint

.PHONY: security-check
security-check:
	npm audit

.PHONY: dependency-check
dependency-check:
	npm audit

.PHONY: package
package: build
ifndef version
	$(error No version given. Aborting)
endif
	$(info Packaging version: $(version))
	$(eval tmpdir := $(shell mktemp -d build-XXXXXXXXXX))
	cp -r ./dist/* $(tmpdir)
	mkdir $(tmpdir)/api-enumerations
	cp ./api-enumerations/*.yml $(tmpdir)/api-enumerations
	cp -r ./package.json $(tmpdir)
	cp -r ./package-lock.json $(tmpdir)
	cd $(tmpdir) && npm i --production
	rm $(tmpdir)/package-lock.json
	cd $(tmpdir) && zip -r ../$(artifact_name)-$(version).zip .
	rm -rf $(tmpdir)

.PHONY: sonar
sonar: test
	npm run sonarqube
