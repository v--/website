import gulp from 'gulp'

import Fork from './fork.mjs'

{
  const child = new Fork('code/server/index')

  gulp.task('server:restart', function () {
    return child.restart()
  })

  process.on('SIGINT', Fork.prototype.kill.bind(child))
}
