import { Observable } from '../../../common/support/observable.mjs'
import Path from '../../../common/support/path.mjs'
import RouterState from '../../../common/support/router_state.mjs'
import unsupported from '../../../common/views/unsupported.mjs'
import { PageUpdateMode } from '../../../common/enums.mjs'
import { CoolError } from '../../../common/errors.mjs'
import { repr } from '../../../common/support/strings.mjs'

import Store, { MockStore } from '../store.mjs'
import router from '../router.mjs'
import { resize } from '../observables.mjs'
import dynamicImport from '../support/dynamic_import.mjs'

function loadBundle (bundle) {
  return dynamicImport(`${window.location.origin}/code/client/${bundle}/index.mjs`)
}

async function loadFactory ({ factory: factorySpec, path }) {
  switch (typeof factorySpec) {
    case 'function': return factorySpec
    case 'string':
      if (window.PLAYGROUND_COMPATIBILITY[path.segments[1]]) {
        return loadBundle(factorySpec)
      }

      return unsupported

    default:
      throw new CoolError(`Invalid page factory spec ${repr(factorySpec)}`)
  }
}

export default class RouterObservable extends Observable {
  static async initialize (serverData) {
    const path = Path.parse(this.readURL())
    const mockStore = new MockStore(serverData)
    const store = new Store()
    const state = await router(path, mockStore)
    return new this(state, store, path)
  }

  static readURL () {
    return document.location.href.slice(document.location.origin.length)
  }

  constructor (initialState, store, path) {
    const state = Object.assign({}, initialState)

    state.loading = true
    state.isCollapsed = !resize.current.isDesktop
    super(state)

    loadFactory(state).then(function (factory) {
      try {
        this.update({ factory, loading: false })
      } catch (err) {
        this.error(err)
      }

      resize.triggerUpdate()
    }.bind(this))

    this.current.toggleCollapsed = function () {
      this.update({ isCollapsed: !this.current.isCollapsed })
      this._notifyOfDelayedResize()
    }.bind(this)

    this.store = store
    this.path = path
    this._bindToResize()

    window.requestAnimationFrame(function () {
      resize.triggerUpdate()
    })
  }

  _bindToResize () {
    this._resizeObserver = {
      next: ({ isDesktop }) => {
        if (!this._isResizeTriggered && this.current.isCollapsed !== !isDesktop) {
          this.update({ isCollapsed: !isDesktop })
          this._notifyOfDelayedResize()
        }

        this._isResizeTriggered = false
      }
    }

    resize.subscribe(this._resizeObserver)
  }

  _notifyOfResize () {
    this._isResizeTriggered = true
    resize.triggerUpdate()
  }

  _notifyOfDelayedResize () {
    window.setTimeout(function () {
      this._notifyOfResize()
    }.bind(this), 400)
  }

  async digestError (err) {
    this.update(RouterState.error(this.constructor.readURL(), err))
  }

  async updateURL () {
    await this.changeURL(this.constructor.readURL(), false)
  }

  async changeURL (url, pushState) {
    const path = Path.parse(url)

    if (pushState) {
      window.history.pushState({ path: path.cooked }, null, path.cooked)
    }

    this.path = path

    if (this.current.pageUpdateMode === PageUpdateMode.TRUST_UNDERCOOKED_URL && path.underCooked === this.current.path.underCooked) {
      this.update({ path })
      return
    }

    this.update(Object.assign({}, this.current, { loading: true }))
    const route = await router(path, this.store)

    // Cancel if another route has started loading
    if (this.path !== path) {
      return
    }

    route.factory = await loadFactory(route)

    if (this.path !== path) {
      return
    }

    this.update(route)
    resize.triggerUpdate()
  }

  complete () {
    resize.unsubscribe(this._resizeObserver)
    super.complete()
  }
}
