const { CoolError } = require('common/errors');

class InvalidKeyError extends CoolError {}

class FortifiedMap extends Map {
    get(key) {
        if (this.has(key))
            return super.get(key);

        const keys = JSON.stringify(this.keys());
        throw new InvalidKeyError(`Invalid key "${key}". Expected one of ${keys}.`);
    }
}

const fortificationHandler = {
    has(target, key) {
        return target.has(key);
    },

    get(target, key) {
        return target.get(key);
    }
};

function fortify(object) {
    const map = new Map(Object.entries(object));
    return new Proxy(map, fortificationHandler);
}

module.exports = {
    InvalidKeyError,
    FortifiedMap,
    fortify,

    enumerize(...values) {
        const map = new Map(values.map(value => [value, Symbol(value)]));
        return new Proxy(map, fortificationHandler);
    }
};
