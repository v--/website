SOURCE = $(shell find code client tests benchmarks build gulpfile.esm.js -name '*.js' ! -name '_runner.js')

TESTS = $(shell find tests -name '*.js' ! -name '_*.js')
BENCHMARKS = $(shell find benchmarks -name '*.js' ! -name '_*.js')

.PHONY: test benchmark build $(SOURCE)

test ?= $(shell find tests -name '*.js' ! -name '_*.js')

build: lint test tests/_observables.js
	@env NODE_ENV=production gulp client:build

$(BENCHMARKS):
	@node $@

lint:
	@eslint $(SOURCE)

tests/_observables.js:
	@node $@

$(TESTS):
	@./mocha_wrapper.js $@

test:
	@./mocha_wrapper.js $(TESTS)
