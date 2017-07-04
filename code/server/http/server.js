const http = require('http')

const FortifiedMap = require('common/support/fortified_map')
const { CoolError } = require('common/errors')
const { bind } = require('common/support/functools')

const { promisory } = require('server/support/async')
const Logger = require('server/support/logger')
const DB = require('server/db')
const router = require('server/router')
const Response = require('server/http/response')

class HTTPServer {
    constructor(config) {
        this.socket = config.server.socket
        this.logger = new Logger('HTTP')
        this.state = HTTPServer.State.get('inactive')
        this.db = new DB(config.db)
    }

    async requestHandler(request, response) {
        let context

        if (request.method === 'GET' || request.method === 'HEAD') {
            this.logger.debug(`${request.method} on ${request.url}`)
            context = await router(this.db, request.url)
        } else {
            this.logger.warn(`Unexpected method ${request.method} on ${request.url}`)
            context = null
        }

        if (context === null)
            context = Response.notFound(request.url)

        response.writeHead(context.code, {
            'Content-Type': context.mimeType
        })

        return new Promise(function (resolve, reject) {
            context.stream
                .pipe(response)
                .on('end', resolve)
                .on('error', reject)
        })
    }

    async reload(config) {
        if (config.server.socket !== this.socket) {
            this.logger.info('Server socket changed. Forcing hard reload.')
            await this.stop()
            this.socket = config.server.socket
            this.db.reload(config.db)
            await this.start()
        } else {
            this.logger.info('Server socket not changed. Only reloading the db.')
            this.db.reload(config.db)
        }
    }

    async start() {
        CoolError.assert(this.state === HTTPServer.State.get('inactive'), 'The server is already running.')

        this.state = HTTPServer.State.get('starting')
        this.server = http.createServer(async function (request, response) {
            try {
                await this.requestHandler(request, response)
            } catch (e) {
                this.logger.warn(`Error while processing ${request.method} ${request.url}: ${e}`)
            }
        }.bind(this))

        await this.db.load()
        await (promisory(bind(this.server, 'listen')))(this.socket)
        this.logger.info(`Started web server on unix:${this.socket}.`)
        this.state = HTTPServer.State.get('running')
    }

    async stop() {
        CoolError.assert(this.state === HTTPServer.State.get('running'), 'The server is not running.')
        this.state = HTTPServer.State.get('stopping')

        await (promisory(bind(this.server, 'close')))()
        this.logger.info('Server stopped.')
        this.state = HTTPServer.State.get('inactive')
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
