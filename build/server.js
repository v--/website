import gulp from 'gulp'

import { Fork } from './fork.js'

{
  const child = new Fork('code/server/index.js', { env: { NODE_OPTIONS: '--experimental-modules' } })

  gulp.task('server:restart', function () {
    return child.restart()
  })

  process.on('SIGINT', Fork.prototype.kill.bind(child))
}
