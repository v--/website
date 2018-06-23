import http from 'http'

import FortifiedMap from '../../common/support/fortified_map'
import { HTTPError, CoolError, NotFoundError } from '../../common/errors'
import { bind } from '../../common/support/functions'
import RouterState from '../../common/support/router_state'
import Path from '../../common/support/path'

import { promisory } from '../support/async'
import Logger from '../support/logger'
import Response from '../http/response'
import DB from '../db'
import router from '../router'

export default class HTTPServer {
  constructor (config) {
    this.socket = config.server.socket
    this.logger = new Logger('HTTP')
    this.state = HTTPServer.State.get('inactive')
    this.db = new DB(config.db)
  }

  async requestHandler (request, response) {
    const path = Path.parse(request.url)

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      this.logger.warn(`Unexpected method ${request.method} on ${path.cooked}`)
      return Promise.then()
    }

    this.logger.debug(`${request.method} on ${path.cooked}`)
    await this.writeResponse(response, await router(path, this.db))
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
      this.db.reload(config.db)
      await this.start()
    } else {
      this.logger.info('Server socket not changed. Only reloading the db.')
      this.db.reload(config.db)
    }
  }

  async start () {
    CoolError.assert(this.state === HTTPServer.State.get('inactive'), 'The server is already running.')

    this.state = HTTPServer.State.get('starting')
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

    await this.db.load()
    await (promisory(bind(this.server, 'listen')))(this.socket)
    this.logger.info(`Started web server on unix:${this.socket}.`)
    this.state = HTTPServer.State.get('running')
  }

  async stop () {
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
