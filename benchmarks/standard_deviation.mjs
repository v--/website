import { expect } from '../code/tests'
import { run } from '../code/benchmarks'

import { map, reduce, range } from '../code/common/support/iteration'

const data = Array.from(range(0, 10 ** 5))

it('loops are fastest, the other options are non-deterministic', async function () {
    const sortedResults = await run(
        function arrays() {
            const n = data.length
            const mean = data.reduce((a, b) => a + b / n, 0)
            const variance = data
                .map(x => ((x - mean) ** 2) / (n - 1))
                .reduce((a, b) => a + b)

            const sd = variance ** 0.5
            return sd
        },

        function generators() {
            const n = data.length
            const mean = reduce((a, b) => a + b / n, data, 0)
            const variance = reduce((a, b) => a + b, map(x => ((x - mean) ** 2) / (n - 1), data))
            const sd = variance ** 0.5
            return sd
        },

        function loops() {
            const n = data.length

            let mean = 0
            let variance = 0

            for (const value of data)
                mean += value / n

            for (const value of data)
                variance += ((value - mean) ** 2) / (n - 1)

            const sd = variance ** 0.5
            return sd
        }
    )

    expect(sortedResults[0].name === 'loops')
})
