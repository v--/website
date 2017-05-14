const { chain } = require('common/support/itertools');
const FortifiedMap = require('common/support/fortified_map');
const ActualSet = require('common/support/actual_set');

module.exports = class ReactiveMap extends FortifiedMap {
    constructor(source) {
        super(source);
        this.listeners = new Set();
    }

    set(key, value) {
        super.set(key, value);

        for (const listener of this.listeners.values())
            listener();
    }

    *updated(other) {
        const aKeys = new ActualSet(this.payload.keys());
        const bKeys = new ActualSet(other.payload.keys());

        for (const key of aKeys.intersection(bKeys).values())
            if (this.get(key) !== other.get(key))
                yield key;
    }

    *diff(other) {
        for (const key of this.payload.keys())
            if (!other.has(key))
                yield key;
    }

    equals(other) {
        const iter = chain(this.updated(other), this.diff(other), other.diff(this));
        return iter.next().done;
    }
};
