const { zip } = require('common/support/itertools');

module.exports = function trivialConstructor(...argNames) {
    return function(...args) {
        for (const [name, value] of zip(argNames, args))
            this[name] = value;
    };
};
