import http from 'http';
import fs from 'fs';

import Logger from 'server/support/logger';

const port = 8000;
const logger = new Logger('HTTP', true);

function requestHandler(request, response) {
  logger.debug(`${request.method} on ${request.url}`);
  response.end(fs.readFileSync('dist/views/index.html').toString('utf-8'));
}

http.createServer(requestHandler).listen(port, function (err) {
    if (err)
        logger.fatal(err);

    logger.info(`Started web server on http://localhost:${port}.`);
});
