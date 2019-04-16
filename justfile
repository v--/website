export NODE_PATH = "code/"

benchmark file='benchmarks/*.mjs':
    node --experimental-modules {{file}}

test:
    env NODE_OPTIONS='--experimental-modules' mocha --delay tests/_runner.js

lint:
    standard $(find build benchmarks code tests -iname '*.mjs') gulpfile.mjs

build:
    env NODE_ENV=production ./gulp.mjs client:build
