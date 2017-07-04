/* eslint-env browser */

const Cache = require('client/support/cache')

module.exports = class DB {
    constructor({ dbID, data }) {
        this.cache = new Cache(60 * 1000)
        this.cache.set(dbID, data)
    }

    async retrieve(dbID) {
        if (this.cache.has(dbID))
            return this.cache.get(dbID)

        const data = await window.fetch(`/api/${dbID}`)
        const json = await data.json()
        this.cache.set(dbID, json)
        return json
    }
}
