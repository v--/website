import Benchmark from 'benchmark'
import { Action } from '../common/types/typecons.js'

interface BenchmarkEvent {
  target: Benchmark
}

export function run(...benchmarks: Array<Action<void>>) {
  const suite = new Benchmark.Suite()

  for (const benchmark of benchmarks) {
    suite.add(benchmark.name, benchmark)
  }

  suite.on('cycle', function(event: BenchmarkEvent) {
    console.log(String(event.target)) // eslint-disable-line no-console
  })

  return new Promise(function(resolve, reject) {
    suite
      .on('error', function(event: BenchmarkEvent) {
        reject(event.target.error)
      })
      .on('complete', function(this: unknown) {
        const array = Array.prototype.slice.call(this)
        array.sort((a, b) => a.stats.mean - b.stats.mean)
        resolve(array)
      })
      .run()
  })
}
