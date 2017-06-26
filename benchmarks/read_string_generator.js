const run = require('./run')

const paragraph = `Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`.split(' ')

function *generator() {
    yield* paragraph
}

/**
 * Take an iterable of strings (or things that will be converted to strings) and allow reading it
 * in portions. This is created to be more performant than per-letter iterators using chain and take.
 */
class StringBuffer {
    constructor(iterable) {
        this.iter = iterable[Symbol.iterator]()
        const { value, done } = this.iter.next()
        this.exhausted = done

        if (done)
            this.buffer = ''
        else
            this.buffer = value
    }

    read(size) {
        let result = this.buffer.substr(0, size)
        this.buffer = this.buffer.substr(size)

        // Don't iterate further if the buffer contains enough information.
        // However, if the buffer has been emptied, iterate further and check exhaustion as a side effect.
        if (result.length === size && this.buffer)
            return result

        // for (const value of this.iter) { // Somehow this skips the last element sometimes.
        for (let { value, done } = this.iter.next(); !done; { value, done } = this.iter.next()) {
            const diff = size - result.length
            result += value.substr(0, diff)

            if (value.length > diff)
                this.buffer = value.substr(diff)

            if (result.length === size)
                return result
        }

        this.exhausted = true
        return result
    }
}

function *flattenStringIterable(iterable) {
    for (const element of iterable)
        yield* element
}

function *take(iterable, count) {
    let counter = 0

    for (const value of iterable) {
        yield value

        if (++counter === count)
            return
    }
}

run(
    function iterators() {
        const flattened = flattenStringIterable(generator())
        let result
        let delta

        do
            result += delta = Array.from(take(flattened, 100)).join('')
        while (delta)

        return result
    },

    function buffered() {
        const buffer = new StringBuffer(generator())
        let result = '' // Make sure that things don't get optimized out

        while (!buffer.exhausted)
            result += buffer.read(100)

        return result
    }
)
