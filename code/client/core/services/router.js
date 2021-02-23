import { DictSubject } from '../../../common/observables/dict_subject.js'
import { Path } from '../../../common/support/path.js'
import { CoolError } from '../../../common/errors.js'

import { Store, MockStore } from '../store.js'
import { clientRouter } from '../router.js'
import { windowSize$ } from '../shared_observables.js'
import { loadBundle, isBrowserCompatibleWithBundle } from '../support/load_bundle.js'
import { navigateTo } from '../support/dom.js'
import { unsupported } from '../../../common/views/unsupported.js'
import { repr } from '../../../common/support/strings.js'
import { createErrorState } from '../../../common/support/router_state.js'

class RoutingError extends CoolError {}

/**
 * @param {TComponents.FactoryComponentType<TRouter.IRouterState> | TPlayground.PlaygroundPage} factorySpec
 * @returns {Promise<TComponents.FactoryComponentType<TRouter.IRouterState>>}
 */
export async function loadFactory(factorySpec) {
  switch (typeof factorySpec) {
    case 'function': return factorySpec
    case 'string':
      if (isBrowserCompatibleWithBundle(factorySpec)) {
        return loadBundle(factorySpec)
      }

      return unsupported

    default:
      throw new RoutingError(`Invalid page factory spec ${repr(factorySpec)}`)
  }
}

export class RouterService {
  /**
   * @param {string} url
   * @param {any} serverData
   * @param {any} errorData
   */
  static async initialize(url, serverData, errorData) {
    const path = Path.parse(url)
    const mockStore = new MockStore(serverData)
    const store = new Store()
    const state = await clientRouter(path, errorData ? store : mockStore)
    return new this(state, store, path)
  }

  /**
   * @param {TRouter.IRouterResult} initialState
   * @param {Store} store
   * @param {Path} path
   */
  constructor(initialState, store, path) {
    /** @type {Path[]} */
    this.pathQueue = []

    /** @type {DictSubject<TRouter.IRouterState>} */
    this.state$ = new DictSubject({
      ...initialState,
      loading: true,
      isCollapsed: !windowSize$.value.isDesktop,
      toggleCollapsed: () => {
        const newValue = !this.state$.value.isCollapsed
        this.state$.update({ isCollapsed: newValue })
      }
    })

    loadFactory(initialState.factory).then(factory => {
      try {
        this.state$.update({ factory, loading: false })
      } catch (err) {
        this.state$.error(err)
      }
    })

    this.store = store
    this.path = path

    this.resizeObserver = {
      next:
        /** @param {import('../support/dom_observables.js').WindowSize} windowSize */
        (windowSize) => {
          const newValue = !windowSize.isDesktop

          if (this.state$.value.isCollapsed !== newValue) {
            this.state$.update({ isCollapsed: newValue })
          }
        }
    }

    windowSize$.subscribe(this.resizeObserver)
  }

  /**
   * @param {string} url
   * @param {Error} err
   */
  async displayError(url, err) {
    this.state$.update(createErrorState(Path.parse(url), err))
  }

  /**
   * @param {Path} path
   * @returns {Promise<void>}
   * @private
   */
  async processPath(path) {
    this.path = path

    const isCollapsed = this.state$.value.isCollapsed || !windowSize$.value.isDesktop

    if (path.underCooked === this.state$.value.path.underCooked) {
      this.state$.update({ path, isCollapsed })
      return
    }

    this.state$.update({ loading: true, isCollapsed })
    const route = await clientRouter(path, this.store)

    // Cancel if another route has started loading
    if (this.path !== path) {
      return
    }

    const factory = await loadFactory(route.factory)

    if (this.path !== path) {
      return
    }

    this.state$.update({ ...route, isCollapsed, factory, loading: false })
  }

  async processPaths() {
    if (this.processing) {
      return
    }

    this.processing = true

    while (this.pathQueue.length > 0) {
      const path = /** @type {Path} */ (this.pathQueue.pop())

      while (this.pathQueue.length > 0) {
        this.pathQueue.pop()
      }

      await this.processPath(path)
      navigateTo(path.cooked)
    }

    this.processing = false
  }

  /**
   * @param {string} url
   */
  async processURL(url) {
    const path = Path.parse(url)
    this.pathQueue.push(path)
    await this.processPaths()
  }

  /**
   * @param {string} url
   */
  async changeURL(url) {
    const path = Path.parse(url)
    this.pathQueue.push(path)
    await this.processPaths()
  }
}
