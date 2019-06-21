.PHONY: test benchmark build

SOURCE = $(shell find . -name '*.mjs')

benchmark ?= benchmarks/*.mjs

lint:
	@standard ${SOURCE}

test:
	env NODE_OPTIONS='--experimental-modules' mocha --delay tests/_runner.js

benchmark:
	node --experimental-modules ${benchmark}

build: lint test
	env NODE_ENV=production ./gulp.mjs client:build
