import gulp from 'gulp'

import { armor } from './build/armor.js'
import { sync } from './build/sync.js'
import './build/client.js'
import './build/server.js'

gulp.task('watch', function(done) {
  gulp.watch('client/styles/**/*.scss', armor(gulp.series('client:build:styles')))
  gulp.watch('client/assets/**/*', armor(gulp.series('client:build:assets')))
  gulp.watch('client/svgs/**/*.svg', armor(gulp.series('client:build:svgs')))
  gulp.watch('client/icons.json', armor(gulp.series('client:build:icons', 'server:restart')))

  gulp.watch('code/server/**/*.ts', armor(gulp.series('server:restart')))
  gulp.watch('code/client/**/*.ts', armor(gulp.series('client:build:code', 'client:restart')))
  gulp.watch('code/common/**/*.ts', armor(gulp.parallel('server:restart', 'client:build:code', 'client:restart')))

  sync.init()

  process.on('SIGINT', function() {
    done()
    sync.destruct()
    process.exit() // eslint-disable-line no-process-exit
  })
})

gulp.task('build', gulp.series('server:build', 'client:build'))
gulp.task('default', gulp.series(armor(gulp.series('client:build')), 'server:restart', 'watch'))
