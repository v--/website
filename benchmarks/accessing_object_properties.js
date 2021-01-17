import { writeFile } from 'fs/promises'

import { run } from './_common.js'

let dummy = false // Try to force the compiler to not optimize out the property access code

await run(
  function mutableProperties() {
    class Test {
      /**
       * @param {int32} age
       */
      constructor(age) {
        this.age = age
        this.isAdult = age >= 18
      }
    }

    const test = new Test(31)
    dummy = test.isAdult
  },

  function mutableGetters() {
    class Test {
      /**
       * @param {int32} age
       */
      constructor(age) {
        this.age = age
      }

      get isAdult() {
        return this.age >= 18
      }
    }

    const test = new Test(31)
    dummy = test.isAdult
  },

  function frozenProperties() {
    class Test {
      /**
       * @param {int32} age
       */
      constructor(age) {
        this.age = age
        this.isAdult = age >= 18
        Object.freeze(this)
      }
    }

    const test = new Test(31)
    dummy = test.isAdult
  },

  function frozenGetters() {
    class Test {
      /**
       * @param {int32} age
       */
      constructor(age) {
        this.age = age
        Object.freeze(this)
      }

      get isAdult() {
        return this.age >= 18
      }
    }

    const test = new Test(31)
    dummy = test.isAdult
  }
)

await writeFile('/dev/null', String(dummy))
