const { join } = require('path');

const { HTTPError, NotFoundError } = require('common/errors');
const URL = require('common/support/url');
const trivialConstructor = require('common/support/trivial_constructor');

const ResponseContext = require('server/http/response_context');

const routes = require('server/routes/index');

module.exports = class RequestContext extends trivialConstructor('request', 'response') {
    async process() {
        const publicFile = await ResponseContext.forFile(join('dist', 'public', this.request.url));

        if (publicFile) {
            this.writeResponseContext(publicFile);
            return;
        }

        const url = new URL(this.request.url);

        if (!routes.hasOwnProperty(url.route)) {
            this.writeNotFound();
            return;
        }

        try {
            const responseContext = await routes[url.route]({
                url: url.subroute
            });

            this.writeResponseContext(responseContext);
        } catch (e) {
            if (e instanceof HTTPError)
                this.writeHTTPError(e);
            else
                throw e;
        }
    }

    writeResponseContext(context) {
        this.response.writeHead(200, {
            'Content-Type': context.mimeType,
            'Content-Length': context.size
        });

        context.stream.pipe(this.response);
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
