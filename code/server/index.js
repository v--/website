const HTTPServer = require('server/http/server');

const server = new HTTPServer(8000);

server.start();

for (const signal of ['SIGINT', 'SIGTERM'])
    process.on(signal, function () {
        if (server.state === HTTPServer.State.get('running')) {
            server.logger.info(`Received signal ${signal}. Shutting down server.`);
            server.stop(signal);
        }
    });
