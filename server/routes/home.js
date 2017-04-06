const { NotFoundError, Response } = require('common/http');
const { Readable } = require('stream');

module.exports = function home({ h, url }) {
    if (url !== '')
        throw new NotFoundError();

    const stream = new Readable();
    stream.push('home sweet home');
    stream.push(null);
    return new Response(stream, 15, 'text/plain');
};
