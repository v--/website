/* eslint-env browser */

const { CoolError, HTTPError, NotFoundError } = require('common/errors')

const Cache = require('client/support/cache')

module.exports = class DB {
    constructor({ id, error, errorCls, data }) {
        this.cache = new Cache(60 * 1000)

        if (error) {
            switch (errorCls) {
            case 'NotFoundError':
                this.error = new NotFoundError(error.viewIDv)
                break

            case 'HTTError':
                this.error = new HTTPError(error.code, error.message, error.viewID)
                break

            case 'CoolError':
                this.error = new CoolError(error.message)
                break

            default:
                this.error = new Error(error.message)
                break
            }
        }

        if (data)
            this.cache.set(id, data)
    }

    async retrieve(id) {
        if (this.error) {
            const error = this.error
            delete this.error
            throw error
        }

        if (this.cache.has(id))
            return this.cache.get(id)

        const response = await window.fetch(`/api/${id}`)

        if (response.status === 404)
            throw new NotFoundError(id)

        const json = await response.json()
        this.cache.set(id, json)
        return json
    }
}
