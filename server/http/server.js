const http = require('http');

const { enumerize } = require('common/support/enumerize');
const { CoolError } = require('common/errors');

const RequestContext = require('server/http/request_context');
const Logger = require('server/support/logger');

class HTTPServer {
    constructor(port) {
        this.port = port;
        this.logger = new Logger('HTTP');
        this.state = HTTPServer.State.inactive;
    }

    requestHandler(request, response) {
        const context = new RequestContext(request, response);

        if (request.method === 'GET' || request.method === 'HEAD') {
            this.logger.debug(`${request.method} on ${request.url}`);
            context.process().catch(Logger.prototype.warn.bind(this.logger));
        } else {
            this.logger.warn(`Unexpected method ${request.method} on ${request.url}`);
            context.writeNotFound();
        }
    }

    start() {
        this.state = HTTPServer.State.starting;

        this.server = http.createServer(this.requestHandler.bind(this)).listen(this.port, err =>  {
            if (err)
                this.logger.fatal(err);

            this.logger.info(`Started web server on http://localhost:${this.port}.`);
            this.state = HTTPServer.State.running;
        });
    }

    stop() {
        CoolError.assert(this.state === HTTPServer.State.running, 'The server is not running.');
        this.state = HTTPServer.State.stopping;

        return this.server.close(() => {
            this.logger.info('Server stopped.');
            this.state = HTTPServer.State.inactive;
        });
    }
}

HTTPServer.State = enumerize(
    'starting',
    'running',
    'stopping',
    'inactive'
);

module.exports = HTTPServer;
