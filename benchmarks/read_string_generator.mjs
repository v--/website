import { expect } from '../code/tests'
import { run } from '../code/benchmarks'

import { take } from '../code/common/support/iteration'
import StringBuffer from '../code/common/support/string_buffer'

const paragraph = `Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`.split(' ')

function *generator() {
    yield* paragraph
}

function *flattenStringIterable(iterable) {
    for (const element of iterable)
        yield* element
}

it("A string buffer is faster than it's corresponding generator approach", async function () {
    const sortedResults = await run(
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

    expect(sortedResults.map(suite => suite.name)).to.deep.equal([
        'buffered',
        'iterators'
    ])
})
