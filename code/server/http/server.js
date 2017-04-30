const http = require('http');

const FortifiedMap = require('common/support/fortified_map');
const { CoolError } = require('common/errors');

const RequestContext = require('server/http/request_context');
const Logger = require('server/support/logger');

class HTTPServer {
    constructor(port) {
        this.port = port;
        this.logger = new Logger('HTTP');
        this.state = HTTPServer.State.get('inactive');
    }

    requestHandler(request, response) {
        const context = new RequestContext(request, response);

        if (request.method === 'GET' || request.method === 'HEAD') {
            this.logger.debug(`${request.method} on ${request.url}`);
            context.process().catch(err => {
                this.logger.warn(err.stack);
            });
        } else {
            this.logger.warn(`Unexpected method ${request.method} on ${request.url}`);
            context.writeNotFound();
        }
    }

    start() {
        this.state = HTTPServer.State.get('starting');

        this.server = http.createServer(this.requestHandler.bind(this)).listen(this.port, err =>  {
            if (err)
                this.logger.fatal(err);

            this.logger.info(`Started web server on http://localhost:${this.port}.`);
            this.state = HTTPServer.State.get('running');
        });
    }

    stop() {
        CoolError.assert(this.state === HTTPServer.State.get('running'), 'The server is not running.');
        this.state = HTTPServer.State.get('stopping');

        return this.server.close(() => {
            this.logger.info('Server stopped.');
            this.state = HTTPServer.State.get('inactive');
        });
    }
}

HTTPServer.State = FortifiedMap.enumerize(
    'starting',
    'running',
    'stopping',
    'inactive'
);

module.exports = HTTPServer;
