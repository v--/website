/* eslint-env browser */
import { Observable } from '../../../common/support/observable.mjs'
import Path from '../../../common/support/path.mjs'
import RouterState from '../../../common/support/router_state.mjs'

import DB from '../db.mjs'
import router from '../router.mjs'
import { resize } from '../observables.mjs'
import dynamicImport from '../support/dynamic_import.mjs'

function loadBundle (bundle) {
  return dynamicImport(`${location.origin}/code/client/${bundle}/index.mjs`)
}

export default class RouterObservable extends Observable {
  static async initialize () {
    const path = Path.parse(this.readURL())

    // "data" is the id a script element
    const db = new DB(JSON.parse(window.data.textContent))
    const state = await router(path, db)

    return new this(state, db, path)
  }

  static readURL () {
    return document.location.href.slice(document.location.origin.length)
  }

  constructor (initialState, db, path) {
    const state = Object.assign({}, initialState)

    if (state.bundle) {
      state.loading = true
      loadBundle(state.bundle).then(factory => {
        this.update({ factory, loading: false })
        resize.triggerUpdate()
      })
    }

    state.isCollapsed = !resize.current.isDesktop
    super(state)

    this.current.toggleCollapsed = function () {
      this.update({ isCollapsed: !this.current.isCollapsed })
      this._notifyOfDelayedResize()
    }.bind(this)

    this.db = db
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
    this.update(Object.assign({}, this.current, { loading: true }))

    if (pushState) {
      history.pushState({ path: path.cooked }, null, path.cooked)
    }

    this.path = path
    const route = await router(path, this.db)

    // Cancel if another route has started loading
    if (this.path !== path) {
      return
    }

    if (route.bundle) {
      route.factory = await loadBundle(route.bundle)
    }

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
