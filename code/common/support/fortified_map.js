const { map } = require('common/support/itertools');
const { CoolError } = require('common/errors');

class InvalidKeyError extends CoolError {}

/**
 * A wrapper around ES6 maps that has throws errors when getting invalid keys.
 * Extending the built-in Map object doesn't seem to work properly with custom
 * constructors.
 */
module.exports = class FortifiedMap {
    static enumerize(...values) {
        return new this(map(value => [value, Symbol(value)], values));
    }

    static fromObject(object) {
        return new this(Object.entries(object));
    }

    constructor(iterable) {
        this.payload = new Map(iterable);
    }

    set(key, value) {
        this.payload.set(key, value);
    }

    has(key) {
        return this.payload.has(key);
    }

    get(key, defaultValue) {
        if (this.has(key))
            return this.payload.get(key);

        if (defaultValue !== undefined)
            return defaultValue;

        throw new InvalidKeyError(`Invalid key "${key}".`);
    }

    [Symbol.iterator]() {
        return this.payload.entries();
    }

    dup() {
        return new this.constructor(this);
    }
};
