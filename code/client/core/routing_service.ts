import { DomManipulator, aggressiveQuerySelector } from './dom.ts'
import { type ClientWebsiteEnvironment } from './environment.ts'
import { type ClientLogger } from './logger.ts'
import { body } from '../../common/components/body.ts'
import { title } from '../../common/components/title.ts'
import { Observable, ReplaySubject, Subject, SubscriptionObserver } from '../../common/observable.ts'
import { type FactoryComponent, c } from '../../common/rendering/component.ts'
import { RenderingManager } from '../../common/rendering/manager.ts'
import { createEncodedErrorState, createErrorState, router } from '../../common/router.ts'
import { AsyncLock } from '../../common/support/async_lock.ts'
import { UrlPath } from '../../common/support/url_path.ts'
import { type IFinalizeable } from '../../common/types/finalizable.ts'
import { type IWebsitePageState } from '../../common/types/page.ts'

export class ClientRoutingService implements IFinalizeable {
  readonly env: ClientWebsiteEnvironment
  readonly logger: ClientLogger
  readonly manipulator: DomManipulator
  readonly renderManager: RenderingManager<Element>
  readonly bodyComponent: FactoryComponent<IWebsitePageState>
  readonly titleComponent: FactoryComponent<IWebsitePageState>
  readonly unload$: Observable<void>

  #pageState$ = new ReplaySubject<IWebsitePageState>()
  #lock = new AsyncLock()
  #isRenderingError = false
  #unload$ = new Subject<void>()

  constructor(logger: ClientLogger, env: ClientWebsiteEnvironment) {
    this.logger = logger
    this.env = env
    this.manipulator = new DomManipulator(logger)
    this.renderManager = new RenderingManager(logger, this.manipulator, env)

    this.titleComponent = c(title, this.#pageState$)
    this.bodyComponent = c(body, this.#pageState$)

    this.unload$ = this.#unload$
  }

  async #acquireLock() {
    await this.#lock.aquire()
  }

  async #releaseLock() {
    const livingCount = SubscriptionObserver.getLivingObserverCount()

    if (livingCount === 1) {
      this.logger.debug('There is one live observer subscription after this render.')
    } else {
      this.logger.debug(`There are ${livingCount} live observer subscriptions after this render.`)
    }

    await this.#lock.release()
  }

  async #getInitialRoutingResult(urlPath: UrlPath) {
    const encodedError = this.env.services.getDehydratedError()

    if (encodedError) {
      this.logger.warn('Displaying dehydrated error', encodedError)
      return createEncodedErrorState(urlPath, encodedError)
    }

    try {
      return await router(urlPath, this.env)
    } catch (err) {
      this.logger.error('An error occurred during initial routing.', err)
      return createErrorState(urlPath, err)
    }
  }

  async #renderBody(urlPath: UrlPath) {
    let err: unknown = undefined

    try {
      return await this.renderManager.render(this.bodyComponent)
    } catch (err_) {
      err = err_
      this.logger.error('Unexpected error during initial render. Attempting recovery.', err)
    }

    this.#isRenderingError = true
    const pageState = createErrorState(urlPath, err)

    try {
      await this.env.processPageChange(pageState)
      this.#pageState$.next(pageState)
      const node = await this.renderManager.render(this.bodyComponent)
      this.#isRenderingError = false
      return node
    } catch (err) {
      this.logger.error('Unexpected error while attempting recovery from initial render error. Aborting.', err)
      throw err
    }
  }

  async initialRender(urlPath: UrlPath) {
    await this.#acquireLock()

    try {
      const pageState = await this.#getInitialRoutingResult(urlPath)
      await this.env.processPageChange(pageState)
      this.#pageState$.next(pageState)

      const newBodyElement = await this.#renderBody(urlPath)
      await this.manipulator.replaceChild(document.documentElement, document.body, newBodyElement)

      const titleElement = aggressiveQuerySelector(document.head, 'title')
      const newTitleElement = await this.renderManager.render(this.titleComponent)
      await this.manipulator.replaceChild(document.head, titleElement, newTitleElement)
    } finally {
      await this.#releaseLock()
    }
  }

  async #processUrlPath(urlPath: UrlPath) {
    await this.#acquireLock()

    try {
      this.env.loading$.next(true)
      const pageState = await router(urlPath, this.env)
      await this.env.processPageChange(pageState)

      const promise = Promise.all([
        this.renderManager.awaitRendering(this.titleComponent),
        this.renderManager.awaitRendering(this.bodyComponent),
      ])

      this.#pageState$.next(pageState)
      await promise

      // If we put this in the finally block, it may trigger an error while we are already trying to recover from one
      this.env.loading$.next(false)
    } finally {
      await this.#releaseLock()
    }
  }

  async processUrlPath(urlPath: UrlPath) {
    try {
      await this.#processUrlPath(urlPath)
    } catch (err) {
      return await this.processError(urlPath, err)
    }
  }

  async #processError(urlPath: UrlPath, err: unknown) {
    await this.#acquireLock()
    this.#isRenderingError = true

    try {
      this.logger.error('An error page has been triggered.', err)
      const pageState = createErrorState(urlPath, err)

      try {
        await this.env.processPageChange(pageState)
      } catch (nestedErr) {
        this.logger.error('Error while processing error page state. Trying to continue with rendering.', nestedErr)
      }

      const promise = Promise.all([
        this.renderManager.awaitRendering(this.titleComponent),
        this.renderManager.awaitRendering(this.bodyComponent),
      ])

      this.#pageState$.next(pageState)
      await promise

      // If a page fails to load but we successfully render an error page, we hide the loading indicator
      this.env.loading$.next(false)
    } finally {
      await this.#releaseLock()
      this.#isRenderingError = false
    }
  }

  async processError(urlPath: UrlPath, err: unknown) {
    if (this.#isRenderingError) {
      this.logger.error('Attempted to render a new error while another one is processing.', err)
    } else {
      try {
        await this.#processError(urlPath, err)
      } catch (nestedErr) {
        this.logger.error('Unexpected new error while rendering error.', nestedErr)
      }
    }
  }

  isRenderingError() {
    return this.#isRenderingError
  }

  async finalize() {
    this.#pageState$.complete()
    this.#unload$.next()
    this.#unload$.complete()
    await this.manipulator.finalize()
    await this.renderManager.finalize()
    // We have not marked the body and title components as managed, so we finalize them manually
    await this.bodyComponent.finalize()
    await this.titleComponent.finalize()
  }
}
