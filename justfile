gulp task='default':
    NODE_PATH=./ gulp {{task}}

tests file='tests/':
    NODE_PATH=code/ mocha --opts tests/mocha.opts -- {{file}}

lint:
    eslint build/ code/
