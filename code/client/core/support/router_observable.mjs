/* eslint-env browser */
import { Observable } from '../../../common/support/observation'
import Path from '../../../common/support/path'

import DB from '../db'
import router from '../router'
import { loadBundle } from '../support/bundles'

const DESKTOP_WIDTH = 700

export default class RouterObservable extends Observable {
  static async create (url) {
    const path = Path.parse(url)

    // "data" is the id a script element
    const db = new DB(JSON.parse(window.data.textContent))
    return new this(await router(path, db), db, path)
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

    window.addEventListener('popstate', function ({ state }) {
      if (state) {
        this.changeURL(state.path, false)
      } else {
        history.back()
      }
    }.bind(this))
  }

  async changeURL (url, pushState) {
    const path = Path.parse(url)
    this.update(Object.assign({}, this.current, { loading: true }))

    if (pushState) {
      history.pushState({ path: path.cooked }, null, path.cooked)
    }

    this.path = path
    const route = await router(path, this.db)

    if (route.bundle) {
      route.factory = await loadBundle(route.bundle)
    }

    this.update(route)
  }
}
