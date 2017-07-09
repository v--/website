const { CoolError } = require('common/errors')

class IterError extends CoolError {}
class EmptyIterError extends IterError {}

module.exports = {
    IterError,
    EmptyIterError,

    all(predicate, iter) {
        for (const value of iter)
            if (!predicate(value))
                return false

        return true
    },

    reduce(reducer, iterable, initial) {
        const iter = iterable[Symbol.iterator]()
        let accum

        if (initial) {
            accum = initial
        } else {
            const state = iter.next()

            if (state.done)
                throw new EmptyIterError('Nothing to reduce')

            accum = state.value
        }

        for (const value of iter)
            accum = reducer(value, accum)

        return accum
    },

    /* eslint-disable require-yield */
    *empty() {
        return
    },
    /* eslint-enable require-yield */

    *range(from, to, step = 1) {
        if (to === undefined) {
            to = from
            from = 0
        }

        for (let i = from; i < to; i += step)
            yield i
    },

    *map(transform, iter) {
        for (const value of iter)
            yield transform(value)
    },

    *filter(predicate, iter) {
        for (const value of iter)
            if (predicate(value))
                yield value
    },

    *chain(...iterables) {
        for (const iterable of iterables)
            yield* iterable
    },

    *take(iterable, count) {
        let counter = 0

        for (const value of iterable) {
            yield value

            if (++counter === count)
                return
        }
    },

    *zip(...iterables) {
        if (iterables.length === 0)
            return []

        const iterators = iterables.map(iterable => iterable[Symbol.iterator]())

        while (true) { // eslint-disable-line no-constant-condition
            const values = Array.of(iterators.length)

            for (const i in iterators) {
                const { done, value } = iterators[i].next()

                if (done)
                    return

                values[i] = value
            }

            yield values
        }
    },

    unique(iter) {
        return new Set(iter).values()
    }
}
