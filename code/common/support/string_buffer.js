/**
 * Take an iterable of strings (or things that will be converted to strings) and allow reading it
 * in portions. This is created to be more performant than per-letter iterators using chain and take.
 */
module.exports = class StringBuffer {
    constructor(iterable) {
        this.iter = iterable[Symbol.iterator]();
        const { value, done } = this.iter.next();
        this.exhausted = done;

        if (done)
            this.buffer = '';
        else
            this.buffer = value;
    }

    read(size) {
        let result = this.buffer.substr(0, size);
        this.buffer = this.buffer.substr(size);

        // Don't iterate further if the buffer contains enough information.
        // However, if the buffer has been emptied, iterate further and check exhaustion as a side effect.
        if (result.length === size && this.buffer)
            return result;

        for (const value of this.iter) {
            const diff = size - result.length;
            result += value.substr(0, diff);

            if (value.length > diff)
                this.buffer = value.substr(diff);

            if (result.length === size)
                return result;
        }

        this.exhausted = true;
        return result;
    }
};
