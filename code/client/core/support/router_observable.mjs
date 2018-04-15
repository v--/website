/* eslint-env browser */
import { Observable } from '../../../common/support/observation'
import Path from '../../../common/support/path'

import DB from '../db'
import router from '../router'

const DESKTOP_WIDTH = 700

export default class RouterObservable extends Observable {
    static async create(url) {
        const path = new Path(decodeURI(url))

        const db = new DB(JSON.parse(document.querySelector('#data').textContent))
        return new this(await router(db, path), db, path)
    }

    constructor(initialState, db, path) {
        super(initialState)

        this.current.isCollapsed = window.innerWidth < DESKTOP_WIDTH

        this.current.toggleCollapsed = function () {
            this.update({ isCollapsed: !this.current.isCollapsed })
        }.bind(this)

        this.db = db
        this.path = path
        history.pushState({ path: path.raw }, null, path.raw)

        window.addEventListener('popstate', function ({ state }) {
            this.changeURL(state.path)
        }.bind(this))
    }

    async changeURL(url) {
        const path = new Path(decodeURI(url))

        history.pushState({ path: this.path.raw }, null, path)
        this.url = path
        this.update(await router(this.db, path))
    }
}
