const http = require('http');
const fs = require('fs');

const Logger = require('./support/logger');

const port = 8000;
const logger = new Logger('HTTP', true);

function requestHandler(request, response) {
    request.connection.ref();

    if (request.method !== 'GET') {
        logger.warn(`${request.method} on ${request.url}`);
        response.status(404);
    } else {
        logger.debug(`${request.method} on ${request.url}`);
        response.end(fs.readFileSync('dist/views/index.html').toString('utf-8'), function () {
            request.connection.unref();
        });
    }
}

const server = http.createServer(requestHandler).listen(port, function (err) {
    if (err)
        logger.fatal(err);

    logger.info(`Started web server on http://localhost:${port}.`);
});

process.on('SIGINT', function () {
    logger.info('Received SIGINT. Shutting server down.');

    server.close(function () {
        logger.info('Server successfully shut down.');
        process.exit(0);
    });
});
