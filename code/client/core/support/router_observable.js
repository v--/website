/* eslint-env browser */
const router = require('common/router')
const { bind } = require('common/support/functools')
const { Observable } = require('common/support/observation')

const db = require('client/core/db')

module.exports = class RouterObservable extends Observable {
    static async create(url) {
        return new this(await router(db, url), url)
    }

    constructor(initialState, url) {
        super(initialState)
        this.current.redirect = bind(this, 'changeURL')
        this.url = url
    }

    async changeURL(url) {
        history.pushState({ path: this.url }, null, url)
        this.update(await router(db, url))
    }
}
