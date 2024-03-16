import Benchmark from 'benchmark'

/**
 * @typedef {{ target: Benchmark }} BenchmarkEvent
 */

/**
 * @param {Array<TCons.Action<void>>} benchmarks
 */
export function run(...benchmarks) {
  const suite = new Benchmark.Suite()

  for (const benchmark of benchmarks) {
    suite.add(benchmark.name, benchmark)
  }

  suite.on('cycle', /** @param {BenchmarkEvent} event */ function(event) {
    // eslint-disable-next-line no-undef, no-console
    console.log(String(event.target)) 
  })

  return new Promise(function(resolve, reject) {
    suite
      .on('error', /** @param {BenchmarkEvent} event */ function(event) {
        reject(event.target.error)
      })
      .on('complete', /** @this {unknown} */ function() {
        const array = Array.prototype.slice.call(this)
        array.sort((a, b) => a.stats.mean - b.stats.mean)
        resolve(array)
      })
      .run()
  })
}
