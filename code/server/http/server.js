import http from 'http'

import { HTTPError, CoolError, NotFoundError } from '../../common/errors.js'
import RouterState from '../../common/support/router_state.js'
import Path from '../../common/support/path.js'

import { promisory } from '../support/async.js'
import Logger from '../support/logger.js'
import Response from '../http/response.js'
import Store from '../store.js'
import router from '../router.js'
import HTTPServerState from '../enums/http_server_state.js'

export default class HTTPServer {
  constructor (config) {
    this.socket = config.server.socket
    this.logger = new Logger('HTTP')
    this.state = HTTPServerState.INACTIVE
    this.store = new Store(config.store)
  }

  async requestHandler (request, response) {
    const path = Path.parse(request.url)

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      this.logger.warn(`Unexpected method ${request.method} on ${path.cooked}`)
      return
    }

    this.logger.debug(`${request.method} on ${path.cooked}`)
    await this.writeResponse(response, await router(path, this.store))
  }

  writeResponse (response, context) {
    response.writeHead(context.code, {
      'Content-Type': context.mimeType,
      'Content-Length': Buffer.byteLength(context.content, 'utf8')
    })

    return new Promise(function (resolve, reject) {
      response.write(context.content, 'utf8', function () {
        response.end()
        resolve()
      })
    })
  }

  async reload (config) {
    if (config.server.socket !== this.socket) {
      this.logger.info('Server socket changed. Forcing hard reload.')
      await this.stop()
      this.socket = config.server.socket
      this.store.reload(config.store)
      await this.start()
    } else {
      this.logger.info('Server socket not changed. Only reloading the store.')
      this.store.reload(config.store)
    }
  }

  async start () {
    CoolError.assert(this.state === HTTPServerState.INACTIVE, 'The server is already running.')

    this.state = HTTPServerState.STARTING
    this.server = http.createServer(async function (request, response) {
      try {
        await this.requestHandler(request, response)
      } catch (e) {
        const path = Path.parse(request.url)

        if (e instanceof NotFoundError) {
          this.logger.warn(`No resource found for ${request.method} ${path.cooked}`)
        } else {
          this.logger.warn(`Error while processing ${request.method} ${path.cooked}: ${e} ${e.stack}`)
        }

        await this.writeResponse(
          response,
          Response.view(RouterState.error(path, e), e instanceof HTTPError ? e.code : 500)
        )
      }
    }.bind(this))

    await this.store.load()
    await (promisory(this.server.listen.bind(this.server)))(this.socket)
    this.logger.info(`Started web server on socket ${this.socket}.`)
    this.state = HTTPServerState.RUNNING
  }

  async stop () {
    CoolError.assert(this.state === HTTPServerState.RUNNING, 'The server is not running.')
    this.state = HTTPServerState.STOPPING

    await (promisory(this.server.close.bind(this.server)))()
    this.logger.info('Server stopped.')
    this.state = HTTPServerState.INACTIVE
  }
}
