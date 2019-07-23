SOURCE = $(shell find . -name '*.mjs')

TESTS = $(shell find tests -name '*.mjs' ! -name '_*.mjs')
BENCHMARKS = $(shell find benchmarks -name '*.mjs' ! -name '_*.mjs')

.PHONY: test test_observables benchmark build $(SOURCE)

test ?= $(shell find tests -name '*.mjs' ! -name '_*.mjs')

$(BENCHMARKS):
	@node --experimental-modules $@

lint:
	@standard $(SOURCE)

tests/_observables.mjs:
	@node --experimental-modules $@

$(TESTS):
	@echo $@ | env NODE_OPTIONS='--experimental-modules' mocha --delay tests/_runner.js

test:
	@echo $(TESTS) | env NODE_OPTIONS='--experimental-modules' mocha --delay tests/_runner.js

build: lint test tests/_observables.mjs
	env NODE_ENV=production ./gulp.mjs client:build
