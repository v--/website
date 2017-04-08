gulp task='default':
    NODE_PATH=./ gulp {{task}}

tests:
    NODE_PATH=code/ mocha --opts tests/mocha.opts tests/

lint:
    eslint build/ code/
