export NODE_PATH = "code/"

test file='tests/':
    mocha --recursive -- {{file}}

benchmark file='benchmarks/':
    mocha --recursive --no-timeouts -- {{file}}

lint:
    eslint benchmarks/ build/ code/ tests/ client/assets/
    sass-lint --verbose

test_all:
	mocha --recursive -- tests/

build_prod:
	env NODE_ENV=production gulp build

deploy server='ivasilev.net' path='/srv/http/ivasilev.net': lint test_all build_prod
	ssh {{server}} sudo systemctl stop website
	ssh {{server}} rm --recursive --force {{path}}
	ssh {{server}} mkdir {{path}} {{path}}/config
	scp -rC code public package.json ivasilev.net:{{path}}
	scp config/prod.json ivasilev.net:{{path}}/config/active.json
	ssh {{server}} 'cd {{path}}; npm install'
	ssh {{server}} sudo systemctl start website
