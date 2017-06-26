const { filter, chain } = require('common/support/itertools')

module.exports = class ActualSet extends Set {
    union(other) {
        return new Set(chain(this.values(), other.values()))
    }

    intersection(other) {
        return new Set(filter(key => other.has(key), this.values()))
    }

    diff(other) {
        return new Set(filter(key => !other.has(key), this.values()))
    }

    symmetricDiff(other) {
        return new Set(
            chain(
                filter(key => !other.has(key), this.values()),
                filter(key => !this.has(key), other.values())
            )
        )
    }

    equals(other) {
        return this.symmetricDiff(other).size === 0
    }
}
