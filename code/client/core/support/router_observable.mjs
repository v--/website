/* eslint-env browser */
import { Observable } from '../../../common/support/observation'

import DB from '../db'
import router from '../router'

const DESKTOP_WIDTH = 700

export default class RouterObservable extends Observable {
    static async create(url) {
        const decoded = decodeURI(url)

        const db = new DB(JSON.parse(document.querySelector('#data').textContent))
        return new this(await router(db, decoded), db, decoded)
    }

    constructor(initialState, db, url) {
        super(initialState)

        this.current.isCollapsed = window.innerWidth < DESKTOP_WIDTH

        this.current.toggleCollapsed = function () {
            this.update({ isCollapsed: !this.current.isCollapsed })
        }.bind(this)

        this.db = db
        this.url = url
        history.pushState({ path: this.url }, null, url)

        window.addEventListener('popstate', function ({ state }) {
            this.changeURL(state.path)
        }.bind(this))
    }

    async changeURL(url) {
        const decoded = decodeURI(url)

        history.pushState({ path: this.url }, null, decoded)
        this.url = decoded
        this.update(await router(this.db, decoded))
    }
}
