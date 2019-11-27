#!/usr/bin/env node

// Stolen from:
//   http://gromnitsky.blogspot.com/2018/09/3-ways-to-use-es6-modules-with-mocha.html

import path from 'path'
import Mocha from './node_modules/mocha/index.js'

Mocha.prototype.loadFiles = async function (fn) {
  for await (let file of this.files) {
    file = path.resolve(file)
    this.suite.emit('pre-require', global, file, this)
    this.suite.emit('require', await import(file), file, this);
    this.suite.emit('post-require', global, file, this)
  }

  fn && fn()
}

Mocha.prototype.run = async function (fn) {
  if (this.files.length > 0) {
    await this.loadFiles()
  }

  const suite = this.suite
  const options = this.options
  options.files = this.files
  const runner = new Mocha.Runner(suite, options.delay)
  const reporter = new this._reporter(runner, options)

  function done (failures) {
    if (reporter.done) {
      reporter.done(failures, fn)
    } else {
      fn && fn(failures)
    }
  }

  runner.run(done)
}

const mocha = new Mocha({ ui: 'bdd', reporter: 'spec' })

for (const fileName of process.argv.slice(2)) {
  mocha.addFile(fileName)
}

mocha.run(function (failures) {
  process.exitCode = failures ? -1 : 0
})
