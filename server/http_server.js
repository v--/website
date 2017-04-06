const http = require('http');

const Logger = require('server/support/logger');
const routes = require('server/routes/index');

const { HTTPError, NotFoundError } = require('common/http');
const URL = require('common/support/url');
const trivialConstructor = require('common/support/trivial_constructor');

class RequestContext extends trivialConstructor('request', 'response') {
    process(logger) {
        const url = new URL(this.request.url);

        if (routes.hasOwnProperty(url.route)) {
            try {
                const res = routes[url.route]({
                    url: url.subroute
                });

                this.response.writeHead(200, {
                    'Content-Type': res.mimeType,
                    'Content-Length': res.size
                });

                res.stream.pipe(this.response);
            } catch (e) {
                if (e instanceof HTTPError)
                    this.writeHTTPError(e);
                else
                    logger.warn(e);
            }
        } else {
            this.writeHTTPError(new NotFoundError());
        }
    }

    writeHTTPError(error) {
        this.response.writeHead(error.code);
        this.response.write(String(error));
        this.response.end();
    }
}

module.exports = class HTTPServer {
    constructor(port) {
        this.port = port;
        this.logger = new Logger('HTTP');

        this.server = http.createServer(this.requestHandler.bind(this)).listen(port, err =>  {
            if (err)
                this.logger.fatal(err);

            this.logger.info(`Started web server on http://localhost:${port}.`);
        });
    }

    requestHandler(request, response) {
        const context = new RequestContext(request, response);

        if (request.method === 'GET' || request.method === 'HEAD') {
            this.logger.debug(`${request.method} on ${request.url}`);
            context.process();
        } else {
            this.logger.warn(`Unexpected method ${request.method} on ${request.url}`);
            context.writeNotFound();
        }
    }

    close() {
        return this.server.close(() => {
            this.logger.info('Server shut down.');
        });
    }
};
