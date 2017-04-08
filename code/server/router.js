const { join } = require('path');

const { NotFoundError } = require('common/errors');
const URL = require('common/support/url');

const ResponseContext = require('server/http/response_context');
const h = require('server/h');

function home(h) {
    return h('div', null, [
            h('h1', null, 'stuff'),
            h('h2', null, 'more stuff')
        ]);
}

module.exports = async function router(requestUrl) {
    const publicFile = await ResponseContext.forFile(join('dist', 'public', requestUrl));

    if (publicFile) {
        return publicFile;
    }

    const url = new URL(requestUrl);

    if (url.route === '' && url.subroute === '') {
        const stream = home(h);
        return new ResponseContext(stream, stream.size, 'text/html');
    }

    throw new NotFoundError();
};
