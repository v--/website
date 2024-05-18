import http from 'http'

import { HTTPError, CoolError, NotFoundError, InternalServerError } from '../../common/errors'
import { Path } from '../../common/support/path.js'

import { Logger } from '../support/logger.js'
import { Response } from '../http/response.js'
import { Store } from '../store.js'
import { serverRouter as router } from '../router.js'
import { createErrorState } from '../../common/support/router_state.js'

export class HTTPServer {
  /**
   * @param {TServer.IWebsiteConfig} config
   */
  constructor(config) {
    this.config = config
    this.socket = config.server.socket
    this.logger = new Logger('HTTP')
    this.store = new Store(config.store)

    /** @type {TServer.HTTPServerState} */
    this.state = 'inactive'

    /** @type {http.Server | undefined} */
    this.server = undefined
  }

  /**
   * @param {http.IncomingMessage} request
   * @param {http.ServerResponse} response
   * @returns {Promise<void>}
   */
  async requestHandler(request, response) {
    const path = Path.parse(/** @type {string} */ (request.url))

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      this.logger.warn(`Unexpected method ${request.method} on ${path.cooked}`)
      return
    }

    this.logger.debug(`${request.method} on ${path.cooked}`)
    await this.writeResponse(response, await router(path, this.store))
  }

  /**
   * @param {http.ServerResponse} response
   * @param {Response} context
   * @returns Promise<void>
   */
  writeResponse(response, context) {
    response.writeHead(context.code, {
      'Content-Type': context.mimeType,
      'Content-Length': Buffer.byteLength(context.content, 'utf8')
    })

    return new Promise(/** @param {TCons.Action<void>} resolve */ function(resolve) {
      response.write(context.content, 'utf8', function() {
        response.end()
        resolve()
      })
    })
  }

  /**
   * @param {TServer.IWebsiteConfig} config
   */
  async reload(config) {
    if (config.server.socket !== this.config.server.socket) {
      this.logger.info('Server socket changed. Forcing hard reload.')
      await this.stop()
      this.config = config
      this.store.reload(config.store)
      await this.start()
    } else {
      this.logger.info('Server socket not changed. Only reloading the store.')
      this.store.reload(config.store)
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async start() {
    CoolError.assert(this.state === 'inactive', 'The server is already running.')

    this.state = 'starting'
    this.server = http.createServer(async(request, response) => {
      try {
        await this.requestHandler(request, response)
      } catch (e) {
        const path = Path.parse(/** @type {string} */ (request.url))

        if (e instanceof NotFoundError) {
          this.logger.warn(`No resource found for ${request.method} ${path.cooked}`)
        } else if (e instanceof Error) {
          this.logger.warn(`Error while processing ${request.method} ${path.cooked}: ${e} ${e.stack}`)
        } else {
          this.logger.warn(`Error while processing ${request.method} ${path.cooked}: ${e}`)
        }

        await this.writeResponse(
          response,
          Response.view(
            createErrorState(
              path,
              e instanceof Error ? e : new InternalServerError(String(e))
            ),
            e instanceof HTTPError ? e.code : 500
          )
        )
      }
    })

    await this.store.load()

    return new Promise((resolve) => {
      if (this.server === undefined) {
        return
      }

      this.server.listen(this.socket, () => {
        this.logger.info(`Started web server on socket ${this.socket}.`)
        this.state = 'running'
        resolve()
      })
    })
  }

  /**
   * @param {string} [signal]
   * @returns {Promise<void>}
   */
  stop(signal) {
    CoolError.assert(this.state === 'running', 'The server is not running.')
    this.state = 'stopping'

    return new Promise((resolve, reject) => {
      if (this.server === undefined) {
        resolve()
        return
      }

      this.server.close((err) => {
        if (err !== null && err !== undefined) {
          reject(err)
          return
        }

        if (signal === undefined)
          this.logger.info('Server stopped.')
        else
          this.logger.info(`Server stopped with signal ${signal}.`)

        this.state = 'inactive'
        resolve()
      })
    })
  }
}
