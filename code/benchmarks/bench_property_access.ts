import fs from 'node:fs/promises'

import { runBenchmark } from './benchmark.ts'
import { type uint32 } from '../common/types/numbers.ts'

let dummy = false // Try to force the compiler to not optimize out the property access code

await runBenchmark(
  function mutableProperties() {
    class Test {
      readonly isAdult: boolean
      readonly age: uint32

      constructor(age: uint32) {
        this.age = age
        this.isAdult = age >= 18
      }
    }

    const test = new Test(31)
    dummy = test.isAdult
  },

  function mutableGetters() {
    class Test {
      readonly age: uint32

      constructor(age: uint32) {
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
      readonly age: uint32
      readonly isAdult: boolean

      constructor(age: uint32) {
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
      readonly age: uint32

      constructor(age: uint32) {
        this.age = age
        Object.freeze(this)
      }

      get isAdult() {
        return this.age >= 18
      }
    }

    const test = new Test(31)
    dummy = test.isAdult
  },
)

await fs.writeFile('/dev/null', String(dummy))
