const { map } = require('common/support/itertools')
const { CoolError } = require('common/errors')

class InvalidKeyError extends CoolError {}

/**
 * A wrapper around ES6 maps that has throws errors when getting invalid keys.
 * Extending the built-in Map object doesn't seem to work properly with custom
 * constructors.
 */
class FortifiedMap {
    static enumerize(...values) {
        return new this(map(value => [value, Symbol(value)], values))
    }

    static fromObject(object) {
        return new this(Object.entries(object))
    }

    constructor(iterable) {
        this._payload = new Map(iterable)
    }

    set(key, value) {
        this._payload.set(key, value)
    }

    setMultiple(object) {
        for (const [key, value] in Object.entries(object))
            this._payload.set(key, value)
    }

    has(key) {
        return this._payload.has(key)
    }

    get(key, defaultValue) {
        if (this.has(key))
            return this._payload.get(key)

        if (defaultValue !== undefined)
            return defaultValue

        throw new InvalidKeyError(`Invalid key "${key}".`)
    }

    delete(key) {
        this._payload.delete(key)
    }

    [Symbol.iterator]() {
        return this._payload.entries()
    }

    dup() {
        return new this.constructor(this)
    }
}

module.exports = FortifiedMap
