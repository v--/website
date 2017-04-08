const { Readable } = require('stream');

const { NotFoundError } = require('common/errors');

const ResponseContext = require('server/http/response_context');

module.exports = function home({ h, url }) {
    if (url !== '')
        throw new NotFoundError();

    const stream = new Readable();
    stream.push('home sweet home');
    stream.push(null);
    return new ResponseContext(stream, 15, 'text/plain');
};
