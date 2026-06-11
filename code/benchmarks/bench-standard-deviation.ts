import { runBenchmark } from './benchmark.ts'
import { range } from '../common/support/iteration.ts'

const data = Array.from(range(0, 10 ** 5))

await runBenchmark(
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
    const mean = data.reduce((a, b) => a + b / n, 0)
    const variance = data.map(x => ((x - mean) ** 2) / (n - 1)).reduce((a, b) => a + b, 0)
    const sd = variance ** 0.5
    return sd
  },

  function loops() {
    const n = data.length

    let mean = 0
    let variance = 0

    for (const value of data) {
      mean += value / n
    }

    for (const value of data) {
      variance += ((value - mean) ** 2) / (n - 1)
    }

    const sd = variance ** 0.5
    return sd
  },
)
