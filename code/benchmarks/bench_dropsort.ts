/* eslint-disable @typescript-eslint/no-explicit-any */
import { runBenchmark } from './benchmark.ts'
import { range } from '../common/support/iteration.ts'

const data = Array.from(range(0, 10 ** 4)).map(() => Math.round(Math.random() * 100))

await runBenchmark(
  // Based on https://codegolf.stackexchange.com/questions/61808/lossy-sorting-implement-dropsort
  function codeGolf() {
    let array = data as any
    return array.filter((val: any) => array > val ? 0 : [array = val])
  },

  function refactoredGolf() {
    let max = Number.NEGATIVE_INFINITY

    return data.filter(function (val) {
      if (max <= val) {
        max = val
        return true
      }

      return false
    })
  },

  function loops() {
    const sorted = []
    let max = Number.NEGATIVE_INFINITY

    for (const val of data) {
      if (max <= val) {
        max = val
        sorted.push(max)
      }
    }
  },
)
