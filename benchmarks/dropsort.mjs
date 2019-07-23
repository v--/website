import { run } from './_common.mjs'

import { map, range } from '../code/common/support/iteration.mjs'

const data = Array.from(map(() => Math.round(Math.random() * 100), range(0, 10 ** 4)))

run(
  // https://codegolf.stackexchange.com/questions/61808/lossy-sorting-implement-dropsort
  function codeGolf () {
    let array = data
    // eslint-disable-next-line no-return-assign
    return array.filter(val => array > val ? 0 : [array = val])
  },

  function refactoredGolf () {
    let max = Number.NEGATIVE_INFINITY

    return data.filter(function (val) {
      if (max <= val) {
        max = val
        return true
      }

      return false
    })
  },

  function loops () {
    const sorted = []
    let max = Number.NEGATIVE_INFINITY

    for (const val of data) {
      if (max <= val) {
        max = val
        sorted.push(max)
      }
    }
  }
)
