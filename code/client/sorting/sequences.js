import { shuffle, range, map, flatten, repeat } from '../../common/support/iteration.js'

export const sequences = Object.freeze([
  {
    name: 'Ascending',
    constructArray () {
      return Array.from(range(1, 26))
    }
  },

  {
    name: 'Descending',
    constructArray () {
      return Array.from(range(25, 0, -1))
    }
  },

  {
    name: 'Shuffled',
    constructArray () {
      return shuffle(range(1, 26))
    }
  },

  {
    name: 'Grouped',
    constructArray () {
      return shuffle(flatten(map(i => repeat(i, 5), range(4, 25, 5))))
    }
  }
])
