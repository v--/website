export NODE_PATH = "code/"

benchmark file='benchmarks/*.mjs':
    node --experimental-modules {{file}}

test:
    env NODE_OPTIONS='--experimental-modules' mocha --delay tests/_runner.js

lint:
    standard $(find build benchmarks code tests -iname '*.mjs') gulpfile.mjs

build:
    env NODE_ENV=production ./gulp.mjs client:build

deploy server='ivasilev.net' path='/srv/http/ivasilev.net': lint test build
    ssh {{server}} sudo systemctl stop website.service
    ssh {{server}} find {{path}} -mindepth 1 -delete

    scp -rC code public package.json ivasilev.net:{{path}}
    scp -rC client/assets/* ivasilev.net:{{path}}/public

    ssh {{server}} mkdir {{path}}/config
    scp config/prod.json ivasilev.net:{{path}}/config/active.json

    ssh {{server}} sudo systemctl start website.service
