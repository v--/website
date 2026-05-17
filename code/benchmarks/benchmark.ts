import Benchmark from 'benchmark'

import { orderComparator } from '../common/support/iteration.ts'
import { type Action } from '../common/types/typecons.ts'
import { ServerLogger } from '../server/logger.ts'

interface BenchmarkEvent {
  target: Benchmark
}

export function runBenchmark(...candidates: Array<Action<void>>) {
  const logger = new ServerLogger('BENCHMARK', 'DEBUG')
  // eslint-disable-next-line import-x/no-named-as-default-member
  const suite = new Benchmark.Suite()
  const { promise, resolve, reject } = Promise.withResolvers()

  for (const candidate of candidates) {
    suite.add(candidate.name, candidate)
  }

  suite
    .on('error', function (event: BenchmarkEvent) {
      reject(event.target.error)
    })
    .on('cycle', function (event: BenchmarkEvent) {
      logger.info(event.target.toString())
    })
    .on('complete', function (this: unknown) {
      const array = Array.prototype.slice.call(this)
      array.sort(orderComparator)
      resolve(array)
    })
    .run()

  return promise
}
