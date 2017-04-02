const http = require('http');
const fs = require('fs');

const Logger = require('./support/logger');


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
        if (request.method !== 'GET') {
            this.logger.warn(`${request.method} on ${request.url}`);
            response.status(404);
        } else {
            this.logger.debug(`${request.method} on ${request.url}`);
            response.end(fs.readFileSync('dist/views/index.html').toString('utf-8'));
        }
    }

    close() {
        this.server.close(() => {
            this.logger.info('Server shut down.');
            process.exit();
        });
    }
};
