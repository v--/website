import Benchmark from 'benchmark'

export function run (...benchmarks) {
  const suite = new Benchmark.Suite()

  for (const benchmark of benchmarks) {
    suite.add(benchmark.name, benchmark)
  }

  suite.on('cycle', function (event) {
    console.log(String(event.target))
  })

  return new Promise(function (resolve, reject) {
    suite
      .on('error', function (event) {
        reject(event.target.error)
      })
      .on('complete', function () {
        const array = Array.prototype.slice.call(this)
        array.sort((a, b) => a.stats.mean - b.stats.mean)
        resolve(array)
      })
      .run()
  })
}
