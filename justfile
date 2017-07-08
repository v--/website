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

build:
	gulp build

deploy server='ivasilev.net' path='/srv/http/ivasilev.net': lint test_all build
	ssh {{server}} sudo systemctl stop website
	ssh {{server}} sudo rm --recursive --force {{path}}
	ssh {{server}} sudo mkdir --mode 777 {{path}}
	scp -rC code public package.json ivasilev.net:{{path}}
	ssh {{server}} mkdir {{path}}/config
	scp config/prod.json ivasilev.net:{{path}}/config/active.json
	ssh {{server}} 'cd {{path}}; npm install'
	ssh {{server}} sudo chown --recursive http:http {{path}}
	ssh {{server}} sudo systemctl start website
