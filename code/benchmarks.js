/* global console */
/* eslint-disable no-console */

const Benchmark = require('benchmark')

module.exports = {
    run(...benchmarks) {
        const suite = new Benchmark.Suite()

        for (const benchmark of benchmarks)
            suite.add(benchmark.name, benchmark)

        suite
            .on('error', function (event) {
              console.error(event.target.error)
            })
            .on('cycle', function (event) {
              console.log(String(event.target))
            })
            .on('complete', function () {
              console.log('Fastest is ' + this.filter('fastest').map('name'))
            })
            .run({ 'async': true })
    }
}
