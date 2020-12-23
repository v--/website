import http from 'http'

import { HTTPError, CoolError, NotFoundError } from '../../common/errors.js'
import { RouterState } from '../../common/support/router_state.js'
import { Path } from '../../common/support/path.js'

import { Logger } from '../support/logger.js'
import { Response } from '../http/response.js'
import { Store } from '../store.js'
import { serverRouter as router } from '../router.js'
import { HTTPServerState } from '../enums/http_server_state.js'
import { IWebsiteConfig } from '../config.js'

export class HTTPServer {
  logger: Logger
  state: HTTPServerState
  socket: string
  store: Store
  private server?: http.Server

  constructor(
    public config: IWebsiteConfig
  ) {
    this.socket = config.server.socket
    this.logger = new Logger('HTTP')
    this.state = HTTPServerState.inactive
    this.store = new Store(config.store)
  }

  async requestHandler(request: http.IncomingMessage, response: http.ServerResponse) {
    const path = Path.parse(request.url!)

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      this.logger.warn(`Unexpected method ${request.method} on ${path.cooked}`)
      return
    }

    this.logger.debug(`${request.method} on ${path.cooked}`)
    await this.writeResponse(response, await router(path, this.store))
  }

  writeResponse(response: http.ServerResponse, context: Response): Promise<void> {
    response.writeHead(context.code, {
      'Content-Type': context.mimeType,
      'Content-Length': Buffer.byteLength(context.content, 'utf8')
    })

    return new Promise(function(resolve) {
      response.write(context.content, 'utf8', function() {
        response.end()
        resolve()
      })
    })
  }

  async reload(config: IWebsiteConfig) {
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

  async start(): Promise<void> {
    CoolError.assert(this.state === HTTPServerState.inactive, 'The server is already running.')

    this.state = HTTPServerState.starting
    this.server = http.createServer(async(request, response) => {
      try {
        await this.requestHandler(request, response)
      } catch (e) {
        const path = Path.parse(request.url!)

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
    })

    await this.store.load()

    return new Promise<void>((resolve) => {
      if (this.server === undefined) {
        return
      }

      this.server!.listen(this.socket, () => {
        this.logger.info(`Started web server on socket ${this.socket}.`)
        this.state = HTTPServerState.running
        resolve()
      })
    })
  }

  stop(signal?: string): Promise<void> {
    CoolError.assert(this.state === HTTPServerState.running, 'The server is not running.')
    this.state = HTTPServerState.stopping

    return new Promise<void>((resolve, reject) => {
      if (this.server === undefined) {
        resolve()
        return
      }

      this.server.close((err) => {
        if (err !== null) {
          reject(err)
          return
        }

        if (signal === undefined)
          this.logger.info('Server stopped.')
        else
          this.logger.info(`Server stopped with signal ${signal}.`)

        this.state = HTTPServerState.inactive
        resolve()
      })
    })
  }
}
