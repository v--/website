const { HTTPError, NotFoundError } = require('common/errors');
const trivialConstructor = require('common/support/trivial_constructor');

const router = require('server/router');

module.exports = class RequestContext extends trivialConstructor('request', 'response') {
    async process() {
        try {
            const responseContext = await router(this.request.url);
            this.writeResponseContext(responseContext);
        } catch (e) {
            if (e instanceof HTTPError)
                this.writeHTTPError(e);
            else
                throw e;
        }
    }

    writeResponseContext(context) {
        context.stream.on('data', data => {
            this.response.write(data);
        });

        context.stream.on('size', size => {
            this.response.writeHead(200, {
                'Content-Type': context.mimeType,
                'Content-Length': size
            });
        });

        context.stream.on('end', () => {
            this.response.end();
        });
    }

    writeHTTPError(error) {
        this.response.writeHead(error.code);
        this.response.write(String(error));
        this.response.end();
    }

    writeNotFound() {
        this.writeHTTPError(new NotFoundError());
    }
};
