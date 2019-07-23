import { run } from './_common.js'

import { writeFile } from '../code/server/support/fs.js'

let dummy // Try to force the compiler to not optimize out the property access code

run(
  function mutableProperties () {
    class Test {
      constructor (age) {
        this.age = age
        this.isAdult = age >= 18
      }
    }

    const test = new Test(31)
    dummy = test.isAdult
  },

  function mutableGetters () {
    class Test {
      constructor (age) {
        this.age = age
      }

      get isAdult () {
        return this.age >= 18
      }
    }

    const test = new Test(31)
    dummy = test.isAdult
  },

  function frozenProperties () {
    class Test {
      constructor (age) {
        this.age = age
        this.isAdult = age >= 18
        Object.freeze(this)
      }
    }

    const test = new Test(31)
    dummy = test.isAdult
  },

  function frozenGetters () {
    class Test {
      constructor (age) {
        this.age = age
        Object.freeze(this)
      }

      get isAdult () {
        return this.age
      }
    }

    const test = new Test(31)
    dummy = test.isAdult
  }
).then(function () {
  writeFile('/dev/null', dummy)
})
