const http = require('http')

const FortifiedMap = require('common/support/fortified_map')
const { CoolError } = require('common/errors')
const { bind } = require('common/support/functools')

const { promisory } = require('server/support/async')
const RequestContext = require('server/http/request_context')
const Logger = require('server/support/logger')

class HTTPServer {
    constructor(socket) {
        this.socket = socket
        this.logger = new Logger('HTTP')
        this.state = HTTPServer.State.get('inactive')
    }

    requestHandler(request, response) {
        const context = new RequestContext(request, response)

        if (request.method === 'GET' || request.method === 'HEAD') {
            this.logger.debug(`${request.method} on ${request.url}`)
            context.process().catch(err => {
                this.logger.warn(err.stack)
            })
        } else {
            this.logger.warn(`Unexpected method ${request.method} on ${request.url}`)
            context.writeNotFound()
        }
    }

    async start() {
        CoolError.assert(this.state === HTTPServer.State.get('inactive'), 'The server is already running.')

        this.state = HTTPServer.State.get('starting')
        this.server = http.createServer(bind(this, 'requestHandler'))

        try  {
            await (promisory(bind(this.server, 'listen')))(this.socket)
            this.logger.info(`Started web server on unix:${this.socket}.`)
            this.state = HTTPServer.State.get('running')
        } catch (e) {
            this.logger.fatal(e)
        }
    }

    async stop(signal = null) {
        CoolError.assert(this.state === HTTPServer.State.get('running'), 'The server is not running.')

        if (signal)
            this.logger.info(`Received signal ${signal}. Shutting down server.`)

        this.state = HTTPServer.State.get('stopping')

        try  {
            await (promisory(bind(this.server, 'close')))()
            this.logger.info('Server stopped.')
            this.state = HTTPServer.State.get('inactive')
        } catch (e) {
            this.logger.fatal(e)
        }
    }
}

Object.defineProperty(HTTPServer, 'State', {
    value: FortifiedMap.enumerize(
        'starting',
        'running',
        'stopping',
        'inactive'
    )
})

module.exports = HTTPServer
