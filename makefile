SOURCE = $(shell find . -name '*.mjs')

.PHONY: test test_observables benchmark build $(SOURCE)

test ?= $(shell find tests -name '*.mjs' ! -name '_*.mjs')

test:
	@echo ${test} | env NODE_OPTIONS='--experimental-modules' mocha --delay tests/_runner.js

benchmarks/*.mjs:
	@node --experimental-modules $@

tests/observables.mjs:
	@node --experimental-modules tests/_observable.mjs

lint:
	@standard ${SOURCE}

build: lint test test_observables
	env NODE_ENV=production ./gulp.mjs client:build
