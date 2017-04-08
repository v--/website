module.exports = {
    zip: function* (...iterables) {
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
