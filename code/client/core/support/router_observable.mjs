/* eslint-env browser */
import { Observable } from '../../../common/support/observable'
import Path from '../../../common/support/path'
import RouterState from '../../../common/support/router_state'

import DB from '../db'
import router from '../router'
import { loadBundle } from '../support/bundles'

const DESKTOP_WIDTH = 700

export default class RouterObservable extends Observable {
  static async initialize () {
    const path = Path.parse(this.readURL())

    // "data" is the id a script element
    const db = new DB(JSON.parse(window.data.textContent))
    return new this(await router(path, db), db, path)
  }

  static readURL () {
    return document.location.href.slice(document.location.origin.length)
  }

  constructor (initialState, db, path) {
    const state = Object.assign({}, initialState)

    if (state.bundle) {
      state.factory = window.bundles.get(state.bundle)
    }

    super(state)
    this.current.isCollapsed = window.innerWidth < DESKTOP_WIDTH

    this.current.toggleCollapsed = function () {
      this.update({ isCollapsed: !this.current.isCollapsed })
    }.bind(this)

    this.db = db
    this.path = path
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

    if (window.innerWidth < DESKTOP_WIDTH) {
      route.isCollapsed = true
    }

    this.update(route)
  }
}
