/* eslint-env browser */
const { bind } = require('common/support/functools')
const { Observable } = require('common/support/observation')

const DB = require('client/core/db')
const router = require('client/router')

module.exports = class RouterObservable extends Observable {
    static async create(url) {
        const db = new DB(JSON.parse(document.querySelector('#data').textContent))
        return new this(await router(db, url), db, url)
    }

    constructor(initialState, db, url) {
        super(initialState)
        this.current.redirect = bind(this, 'changeURL')
        this.db = db
        this.url = url
    }

    async changeURL(url) {
        history.pushState({ path: this.url }, null, url)
        this.update(await router(this.db, url))
    }
}
