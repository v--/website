const gulp = require('gulp')

const { Fork } = require('./fork.cjs')

{
  const child = new Fork('code/server/index.js')

  gulp.task('server:restart', function () {
    return child.restart()
  })

  process.on('SIGINT', Fork.prototype.kill.bind(child))
}
