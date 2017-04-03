const HTTPServer = require('server/http_server');

const server = new HTTPServer(8000);

for (const signal of ['SIGINT', 'SIGTERM'])
    process.on(signal, function () {
        server.logger.info(`Received signal ${signal}. Shutting down server.`);
        server.close(signal, process.exit.bind(process));
    });
