SOURCE = ${shell find code client tests benchmarks build gulpfile.cjs -name '*.*js'}

TESTS = ${shell find tests -name '*.js' ! -name '_*.js'}
BENCHMARKS = ${shell find benchmarks -name '*.js' ! -name '_*.js'}

.PHONY: build server test ${TESTS} ${BENCHMARKS} tests/_observables.js thumbnailer

test ?= ${shell find tests -name '*.js' ! -name '_*.js'}

${BENCHMARKS}:
	@node $@

lint:
	@eslint ${SOURCE}

tests/_observables.js:
	@node $@

${TESTS}:
	@npx mocha $@

test:
	@npx mocha ${TESTS}

build: lint test tests/_observables.js
	@env NODE_ENV=production gulp client:build

thumbnailer:
	@node code/server/commands/thumbnailer.js
