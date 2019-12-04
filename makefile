SOURCE = $(shell find code client tests benchmarks build gulpfile.esm.js -name '*.js')

TESTS = $(shell find tests -name '*.js' ! -name '_*.js')
BENCHMARKS = $(shell find benchmarks -name '*.js' ! -name '_*.js')

.PHONY: build server test $(TESTS) $(BENCHMARKS) tests/_observables.js

test ?= $(shell find tests -name '*.js' ! -name '_*.js')

$(BENCHMARKS):
	@node --require esm $@

lint:
	@eslint $(SOURCE)

tests/_observables.js:
	@node --require esm $@

$(TESTS):
	@npx mocha --require esm $@

test:
	@npx mocha --require esm $(TESTS)

build: lint test tests/_observables.js
	@env NODE_ENV=production gulp client:build
