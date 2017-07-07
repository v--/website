/* eslint-env browser */

const Cache = require('client/support/cache')

module.exports = class DB {
    constructor({ id, data }) {
        this.cache = new Cache(60 * 1000)
        this.cache.set(id, data)
    }

    async retrieve(id) {
        if (this.cache.has(id))
            return this.cache.get(id)

        const data = await window.fetch(`/api/${id}`)
        const json = await data.json()
        this.cache.set(id, json)
        return json
    }
}
