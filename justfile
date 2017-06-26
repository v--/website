test file='tests/':
    NODE_PATH=code/ mocha --opts tests/mocha.opts -- {{file}}

benchmark file:
    NODE_PATH=code/ node -- {{file}}

lint:
    eslint benchmarks/ build/ code/ tests/
