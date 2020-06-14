import { DictSubject } from '../../../common/observables/dict_subject.js'
import { Path } from '../../../common/support/path.js'
import { RouterState } from '../../../common/support/router_state.js'
import { CoolError } from '../../../common/errors.js'

import { Store, MockStore } from '../store.js'
import { clientRouter } from '../router.js'
import { windowSize$ } from '../shared_observables.js'
import { loadBundle, isBrowserCompatibleWithBundle } from '../support/load_bundle.js'
import { navigateTo } from '../support/dom.js'
import { unsupported } from '../../../common/views/unsupported.js'
import { repr } from '../../../common/support/strings.js'

class RoutingError extends CoolError {}

export async function loadFactory ({ factory: factorySpec }) {
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
  static async initialize (url, serverData) {
    const path = Path.parse(url)
    const mockStore = new MockStore(serverData)
    const store = new Store()
    const state = await clientRouter(path, mockStore)
    return new this(state, store, path)
  }

  constructor (initialState, store, path) {
    this.state$ = new DictSubject(
      Object.assign(
        {},
        initialState,
        {
          loading: true,
          isCollapsed: !windowSize$.value.isDesktop,
          toggleCollapsed: function () {
            const newValue = !this.state$.value.isCollapsed
            this.state$.update({ isCollapsed: newValue })
          }.bind(this)
        })
    )

    loadFactory(initialState).then(function (factory) {
      try {
        this.state$.update({ factory, loading: false })
      } catch (err) {
        this.state$.error(err)
      }
    }.bind(this))

    this._store = store
    this._path = path
    this._bindToResize()
  }

  _bindToResize () {
    this._resizeObserver = {
      next: function (windowSize) {
        const newValue = !windowSize.isDesktop

        if (this.state$.value.isCollapsed !== newValue) {
          this.state$.update({ isCollapsed: newValue })
        }
      }.bind(this)
    }

    windowSize$.subscribe(this._resizeObserver)
  }

  async displayError (url, err) {
    this.state$.update(RouterState.error(url, err))
  }

  async processPath (path) {
    this._path = path

    const isCollapsed = this.state$.value.isCollapsed || !windowSize$.value.isDesktop

    if (path.underCooked === this.state$.value.path.underCooked) {
      this.state$.update({ path, isCollapsed })
      return
    }

    this.state$.update({ loading: true, isCollapsed })
    const route = await clientRouter(path, this._store)

    // Cancel if another route has started loading
    if (this._path !== path) {
      return
    }

    route.factory = await loadFactory(route)

    if (this._path !== path) {
      return
    }

    this.state$.update(route)
  }

  async processURL (url) {
    const path = Path.parse(url)
    this.processPath(path)
  }

  async changeURL (url) {
    const path = Path.parse(url)
    navigateTo(path.cooked)
    await this.processPath(path)
  }

  complete () {
    windowSize$.unsubscribe(this._resizeObserver)
    super.complete()
  }
}
