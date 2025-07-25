import http from 'node:http'

import { ServerError } from './errors.ts'
import { parsePreferredLanguage } from './languages.ts'
import { DEFAULT_LANGUAGE, parseSupportedQueryParamLanguage } from '../../common/languages.ts'
import { SubscriptionObserver } from '../../common/observable.ts'
import { PresentableError } from '../../common/presentable_errors.ts'
import { createErrorState } from '../../common/router.ts'
import { UrlPath } from '../../common/support/url_path.ts'
import { type IFinalizeable } from '../../common/types/finalizable.ts'
import { type Action } from '../../common/types/typecons.ts'
import { type IWebsiteConfig } from '../config.ts'
import { ServerWebsiteEnvironment } from '../environment.ts'
import { ServerResponse } from '../http/response.ts'
import { ServerLogger } from '../logger.ts'
import { serverRouter } from '../router.ts'
import { parsePreferenceHeader } from './preferences.ts'
import { ServerServiceManagerFactory } from '../services.ts'

export type HttpServerState = 'starting' | 'running' | 'stopping' | 'inactive'

// The URL is marked as optional, but it is not when the message comes from a server
// See https://stackoverflow.com/a/72664007/2756776
export interface NodeServerMessage extends http.IncomingMessage {
  url: string
}

export class HttpServer implements IFinalizeable {
  readonly logger: ServerLogger
  readonly serviceFactory: ServerServiceManagerFactory
  readonly handleUnexectedError: Action<unknown>

  #server?: http.Server
  #config: IWebsiteConfig
  #state: HttpServerState

  constructor(config: IWebsiteConfig) {
    this.#config = config
    this.logger = new ServerLogger('HTTP', 'DEBUG')
    this.serviceFactory = new ServerServiceManagerFactory(config.services, this.logger)

    this.#server = undefined
    this.#state = 'inactive'
    this.handleUnexectedError = this.#handleUnexpectedError.bind(this)
  }

  #handleUnexpectedError(err: unknown) {
    this.logger.error('Unexpected error:', err)
  }

  getState() {
    return this.#state
  }

  writeResponse(httpResponse: http.ServerResponse, response: ServerResponse): Promise<void> {
    httpResponse.writeHead(response.code, {
      'Content-Type': `${response.mimeType}; charset=utf-8`,
      'Content-Length': Buffer.byteLength(response.content, 'utf-8'),
    })

    return new Promise(function (resolve: Action<void>) {
      httpResponse.write(response.content, 'utf-8', function () {
        httpResponse.end()
        resolve()
      })
    })
  }

  async reload(config: IWebsiteConfig) {
    if (config.server.socket !== this.#config.server.socket) {
      this.logger.info('Server socket changed. Forcing hard reload.')
      await this.stop()
      this.#config = config
      await this.start()
    } else {
      this.logger.info('Server socket not changed. Using soft reload.')
      await this.serviceFactory.reload(config.services)
    }
  }

  async #handleRequest(httpRequest: NodeServerMessage, httpResponse: http.ServerResponse): Promise<void> {
    const urlPath = UrlPath.parse(httpRequest.url)
    const language = parseSupportedQueryParamLanguage(urlPath) ??
      parsePreferredLanguage(httpRequest.headers['accept-language'] ?? '') ??
      DEFAULT_LANGUAGE

    const preferences = parsePreferenceHeader(httpRequest.headers['prefer'])
    const useMockData = preferences.get('data-source') === 'mocked'
    const env = new ServerWebsiteEnvironment({
      services: this.serviceFactory.getManager(useMockData),
      language, loading: true,
    })

    try {
      if (httpRequest.method !== 'GET' && httpRequest.method !== 'HEAD') {
        throw new PresentableError(
          {
            errorKind: 'http',
            code: 400,
            details: {
              bundleId: 'core',
              key: 'error.details.invalid_http_method',
              context: { method: httpRequest.method! },
            },
          },
          `Unexpected HTTP method ${httpRequest.method}`,
        )
      }

      this.logger.info(`${httpRequest.method} on ${urlPath}`)
      const response = await serverRouter(urlPath, env)
      await this.writeResponse(httpResponse, response)
    } catch (err) {
      if (err instanceof PresentableError && err.cause.errorKind === 'http') {
        this.logger.warn(`HTTP Error ${err.cause.code} on ${httpRequest.method} ${urlPath}`)
      } else {
        this.logger.error(`Unexpected error while processing ${httpRequest.method} ${urlPath}`, err)
      }

      const routingResult = createErrorState(urlPath, err)
      await env.preloadPageData(routingResult)

      await this.writeResponse(
        httpResponse,
        await ServerResponse.page(
          routingResult,
          err instanceof PresentableError && err.cause.errorKind === 'http' ? err.cause.code : 500,
          env,
        ),
      )
    } finally {
      await env.finalize()

      const livingCount = SubscriptionObserver.getLivingObserverCount()

      if (livingCount === 1) {
        this.logger.debug(`There is currently ${livingCount} living observer subscription.`)
      } else if (livingCount > 0) {
        this.logger.debug(`There are currently ${livingCount} living observer subscriptions.`)
      }
    }
  }

  async start(): Promise<void> {
    if (this.#state !== 'inactive') {
      throw new ServerError('The server can only be started from an inactive state.')
    }

    process.title = this.#config.server.processName
    await this.serviceFactory.preload()

    this.#state = 'starting'
    this.#server = http.createServer((httpRequest, httpResponse) => {
      this.#handleRequest(httpRequest as NodeServerMessage, httpResponse).catch(this.handleUnexectedError)
    })

    return new Promise(resolve => {
      if (this.#server === undefined) {
        return
      }

      this.#server.listen(this.#config.server.socket, () => {
        this.logger.info(`Started web server on socket ${this.#config.server.socket}.`)
        this.#state = 'running'
        resolve()
      })
    })
  }

  stop(signal?: string): Promise<void> {
    if (this.#state !== 'running') {
      throw new ServerError('The server can only be stopped from a running state.')
    }

    this.#state = 'stopping'

    return new Promise((resolve, reject) => {
      if (this.#server === undefined) {
        resolve()
        return
      }

      this.#server.closeAllConnections()
      this.#server.close(err => {
        if (err !== undefined) {
          reject(err)
          return
        }

        if (signal === undefined) {
          this.logger.info('Server stopped.')
        } else {
          this.logger.info(`Server stopped with signal ${signal}.`)
        }

        this.#state = 'inactive'
        resolve()
      })
    })
  }

  async finalize() {
    if (this.#state === 'running') {
      await this.stop()
    }

    await this.serviceFactory.finalize()
    this.#server?.unref()
  }
}
