import { run } from '../code/benchmarks'

import { writeFile } from '../code/server/support/fs'

it("Freezing an object and/or using getters instead of precomputed properties doesn't affect performance deterministically", async function () {
    let dummy // Try to force the compiler to not optimize out the property access code

    await run(
        function mutableProperties() {
            class Test {
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
                constructor(age) {
                    this.age = age
                    Object.freeze(this)
                }

                get isAdult() {
                    return this.age
                }
            }

            const test = new Test(31)
            dummy = test.isAdult
        },
    )

    await writeFile('/dev/null', dummy)
})
