artifact_name       := certificates.orders.web.ch.gov.uk

.PHONY: build
build: clean 
	npm i 
	build-app 
	build-static
	npm run build

.PHONY: build-app
build-app:
	npm run build

.PHONY: clean
clean:
	rm -rf dist/app dist/static

.PHONY: build-static
build-static:
	gulp static

.PHONY: npm-install
npm-install:
	npm i

.PHONY: gulp-install
gulp-install:
	npm install gulp-cli -g

.PHONY: init
init: npm-install gulp-install

.PHONY: package
package: build
ifndef version
	$(error No version given. Aborting)
endif
	$(info Packaging version: $(version))
	$(eval tmpdir := $(shell mktemp -d build-XXXXXXXXXX))
	cp -r ./dist/* $(tmpdir)
	cp -r ./package.json $(tmpdir)
	cp -r ./package-lock.json $(tmpdir)
	cp ./start.sh $(tmpdir)
	cp ./routes.yaml $(tmpdir)
	cd $(tmpdir) && npm i --production
	rm $(tmpdir)/package.json $(tmpdir)/package-lock.json
	cd $(tmpdir) && zip -r ../$(artifact_name)-$(version).zip .
	rm -rf $(tmpdir)
