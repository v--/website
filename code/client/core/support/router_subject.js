import DictSubject from '../../../common/observables/dict_subject.js'
import Path from '../../../common/support/path.js'
import RouterState from '../../../common/support/router_state.js'
import unsupported from '../../../common/views/unsupported.js'
import PageUpdateMode from '../../../common/enums/page_update_mode.js'
import { CoolError } from '../../../common/errors.js'
import { repr } from '../../../common/support/strings.js'

import Store, { MockStore } from '../store.js'
import router from '../router.js'
import { resize } from '../global_subjects.js'
import { getWindowSize } from '../support/dom.js'
import dynamicImport from '../support/dynamic_import.js'

const RESIZE_DELAY_IN_MS = 400

function loadBundle (bundle) {
  return dynamicImport(`${window.location.origin}/code/client/${bundle}/index.js`)
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

function triggerResizeUpdate () {
  resize.next(getWindowSize())
}

export default class RouterSubject extends DictSubject {
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
    state.isCollapsed = !resize.value.isDesktop
    super(state)

    loadFactory(state).then(function (factory) {
      try {
        this.update({ factory, loading: false })
      } catch (err) {
        this.error(err)
      }

      triggerResizeUpdate()
    }.bind(this))

    this.update({
      toggleCollapsed: function () {
        this.update({ isCollapsed: !this.value.isCollapsed })
        this._notifyOfDelayedResize()
      }.bind(this)
    })

    this.store = store
    this.path = path
    this.subscriptions = []
    this._bindToResize()

    window.requestAnimationFrame(function () {
      triggerResizeUpdate()
    })
  }

  _bindToResize () {
    this._resizeObserver = {
      next: ({ isDesktop }) => {
        if (!this._isResizeTriggered && this.value.isCollapsed !== !isDesktop) {
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
    triggerResizeUpdate()
  }

  _notifyOfDelayedResize () {
    window.setTimeout(function () {
      this._notifyOfResize()
    }.bind(this), RESIZE_DELAY_IN_MS)
  }

  subscribe (...args) {
    const subscription = super.subscribe(...args)
    this.subscriptions.push(subscription)
    return subscription
  }

  emergencyClearSubscriptions () {
    for (const subscription of this.subscriptions) {
      try {
        subscription.unsubscribe()
      } catch (err) {
        console.error(err)
      }
    }

    this.subscriptions = []
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

    if (this.value.pageUpdateMode === PageUpdateMode.TRUST_UNDERCOOKED_URL && path.underCooked === this.value.path.underCooked) {
      this.update({ path })
      return
    }

    this.update({ loading: true })
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
    triggerResizeUpdate()
  }

  complete () {
    resize.unsubscribe(this._resizeObserver)
    super.complete()
  }
}
