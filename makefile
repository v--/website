.PHONY: test test_observables benchmark build

SOURCE = $(shell find . -name '*.mjs')

benchmark ?= benchmarks/*.mjs

lint:
	@standard ${SOURCE}

test:
	env NODE_OPTIONS='--experimental-modules' mocha --delay tests/_runner.js

test_observables:
	env NODE_OPTIONS='--experimental-modules' node tests/_observable.mjs

benchmark:
	node --experimental-modules ${benchmark}

build: lint test test_observables
	env NODE_ENV=production ./gulp.mjs client:build
