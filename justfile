test file='tests/':
    NODE_PATH=code/ mocha --opts tests/mocha.opts -- {{file}}

lint:
    eslint build/ code/
