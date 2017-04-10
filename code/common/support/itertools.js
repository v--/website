module.exports = {
    *map(func, iter) {
        for (const value of iter)
            yield func(value);
    },

    *filter(func, iter) {
        for (const value of iter)
            if (func(value))
                yield value;
    },

    *chain(...iterables) {
        for (const iterable in iterables)
            yield* iterable;
    },

    *take(iterable, count) {
        let counter = 0;

        for (const value of iterable) {
            yield value;

            if (++counter === count)
                return;
        }
    },

    *zip(...iterables) {
        if (iterables.length === 0) {
            return [];
        }

        const iterators = iterables.map(iterable => iterable[Symbol.iterator]());

        while (true) { // eslint-disable-line no-constant-condition
            const values = Array.of(iterators.length);

            for (const i in iterators) {
                const { done, value } = iterators[i].next();

                if (done)
                    return;

                values[i] = value;
            }

            yield values;
        }
    }
};
