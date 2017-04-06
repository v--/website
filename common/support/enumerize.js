const { CoolError } = require('common/errors');

class InvalidKeyError extends CoolError {}

const fortificationHandler = {
    has(target, key) {
        return target.hasOwnProperty(key);
    },

    get(target, key) {
        if (target.has(key)) {
            return target.get(key);
        }

        throw new InvalidKeyError(`Invalid key "${key}". Expected one of ${JSON.stringify(target.keys())}.`);
    }
};

function fortify(object) {
    const map = new Map(Object.keys(object).map(key => [key, object[key]]));
    return new Proxy(map, fortificationHandler);
}

module.exports = {
    InvalidKeyError,
    fortify,

    enumerize(...values) {
        const map = new Map(values.map(value => [value, Symbol(value)]));
        return new Proxy(map, fortificationHandler);
    }
};
