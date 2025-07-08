import { fromEvent } from './dom/observable.ts'
import { getCurrentUrlPath, parsePreferredLanguage, pushIntoHistory } from './dom.ts'
import { ClientWebsiteEnvironment } from './environment.ts'
import { ClientLogger } from './logger.ts'
import { ClientRoutingService } from './routing_service.ts'
import { ClientServiceManager } from './services.ts'
import { CANONICAL_LANGUAGE_STRING, DEFAULT_LANGUAGE, type WebsiteLanguageId, parseSupportedQueryParamLanguage } from '../../common/languages.ts'
import { filter, first, map, startWith, subscribeAsync, takeUntil } from '../../common/observable.ts'
import { type IRenderEvent } from '../../common/rendering/manager.ts'
import { type UrlPath } from '../../common/support/url_path.ts'

const readyState$ = fromEvent(document, 'readystatechange').pipe(
  map(event => (event.target as Document).readyState),
  startWith(document.readyState),
  filter(readyState => readyState === 'complete'),
)

await first(readyState$)

const rawRehydrationData = 'rehydrationData' in window && window.rehydrationData instanceof Node ?
  window.rehydrationData.textContent ?? undefined :
  undefined

const logger = new ClientLogger('RENDERING', 'DEBUG')

if (rawRehydrationData === undefined) {
  logger.info('No rehydration data found')
} else {
  logger.info('Using rehydration data')
}

const services = ClientServiceManager.initializeWithRawRehydrationData(rawRehydrationData)
const initialUrlPath = getCurrentUrlPath()
const language = parseSupportedQueryParamLanguage(initialUrlPath) ?? parsePreferredLanguage() ?? DEFAULT_LANGUAGE

const env = new ClientWebsiteEnvironment({ logger, services, language })
const routingService = new ClientRoutingService(logger, env)
await routingService.initialRender(initialUrlPath)

// Re-rendering has been initialized at this point; it remains to add some handlers of varying importance

async function handleError(err: unknown, urlPath?: UrlPath) {
  await routingService.processError(urlPath ?? getCurrentUrlPath(), err)
}

subscribeAsync(
  routingService.renderManager.renderNotify$,
  {
    async next(renderEvent: IRenderEvent) {
      if (renderEvent.status === 'failure' && !routingService.isRenderingError()) {
        await handleError(renderEvent.error)
      }
    },

    error: handleError,
  },
)

subscribeAsync(
  fromEvent(window, 'error').pipe(takeUntil(routingService.unload$)),
  {
    async next(event: ErrorEvent) {
      await handleError(event.error)
    },
  },
)

subscribeAsync(
  fromEvent(window, 'unhandledrejection').pipe(takeUntil(routingService.unload$)),
  {
    async next(event: PromiseRejectionEvent) {
      await handleError(event.reason)
    },
  },
)

subscribeAsync(
  fromEvent(window, 'popstate').pipe(takeUntil(routingService.unload$)),
  {
    async next(_event: PopStateEvent) {
      await routingService.processUrlPath(getCurrentUrlPath())
    },
  },
)

subscribeAsync(
  env.urlPath$,
  {
    async next(urlPath: UrlPath) {
      await routingService.processUrlPath(urlPath)
      pushIntoHistory(urlPath)
    },

    error: handleError,
  },
)

subscribeAsync(
  env.gettext.language$,
  {
    async next(language: WebsiteLanguageId) {
      document.documentElement.setAttribute('lang', CANONICAL_LANGUAGE_STRING[language])
    },

    error: handleError,
  },
)
