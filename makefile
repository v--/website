SOURCE = $(shell find code client tests benchmarks build gulpfile.cjs -name '*.js' -o -name '*.mjs')

TESTS = $(shell find tests -name '*.js' ! -name '_*.js')
BENCHMARKS = $(shell find benchmarks -name '*.js' ! -name '_*.js')

.PHONY: build server test $(TESTS) $(BENCHMARKS)

test ?= $(shell find tests -name '*.js' ! -name '_*.js')

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

build: lint test tests/_observables.js
	@env NODE_ENV=production gulp --gulpfile gulpfile.cjs client:build

server:
	@gulp --gulpfile gulpfile.cjs
