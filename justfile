test file='tests/':
    NODE_PATH=code/ mocha --recursive -- {{file}}

benchmark file='benchmarks/':
    NODE_PATH=code/ mocha --recursive --no-timeouts -- {{file}}

lint:
    eslint benchmarks/ build/ code/ tests/
    sass-lint --verbose
