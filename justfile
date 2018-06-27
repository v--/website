export NODE_PATH = "code/"

test file:
    mocha --require @std/esm -- {{file}}

benchmark file='benchmarks/*.mjs':
    mocha --require @std/esm --no-timeouts -- {{file}}

lint:
    standard benchmarks/** build/** code/** tests/** client/assets/**.js gulpfile.mjs

test_all:
    just test "$(find . -wholename './tests/*.mjs' | tr '\n' ' ')"

build_prod:
    env NODE_ENV=production ./gulp.mjs build

deploy server='ivasilev.net' path='/srv/http/ivasilev.net': lint test_all build_prod
    ssh {{server}} sudo systemctl stop website.service
    ssh {{server}} find {{path}} -mindepth 1 -delete
    ssh {{server}} mkdir {{path}}/config
    scp -rC code public package.json ivasilev.net:{{path}}
    scp config/prod.json ivasilev.net:{{path}}/config/active.json
    ssh {{server}} 'cd {{path}}; npm install --production'
    ssh {{server}} sudo systemctl start website.service
