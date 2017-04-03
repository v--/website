const http = require('http');

const Logger = require('server/support/logger');
const router = require('server/router');

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
        if (request.method === 'GET' || request.method === 'HEAD') {
            this.logger.debug(`${request.method} on ${request.url}`);
            router(request, response).then(Function);
        } else {
            this.logger.warn(`${request.method} on ${request.url}`);
            response.writeHead(404);
            response.end();
        }
    }

    close() {
        return this.server.close(() => {
            this.logger.info('Server shut down.');
        });
    }
};
