/* eslint-env node */

import gulp from 'gulp'

import './build/client.mjs'
import './build/server.mjs'
import armor from './build/armor.mjs'
import sync from './build/sync.mjs'

gulp.task('watch', function (done) {
  gulp.watch('client/styles/**/*.less', armor(gulp.series('client:styles')))
  gulp.watch('client/assets/**/*', armor(gulp.series('client:assets')))
  gulp.watch('client/svgs/**/*.svg', armor(gulp.series('client:svgs')))
  gulp.watch('client/icons.json', armor(gulp.series('client:code', 'server:restart')))

  gulp.watch('code/client/**/*.mjs', armor(gulp.series('client:code')))
  gulp.watch('code/server/**/*.mjs', armor(gulp.series('server:restart')))
  gulp.watch(['code/common/**/*.mjs', '!code/common/icons.mjs'], armor(gulp.parallel('server:restart', 'client:code')))

  sync.init()

  process.on('SIGINT', function () {
    done()
    sync.destruct()
    process.exit()
  })
})

gulp.task('build', gulp.parallel('server:build', 'client'))
gulp.task('default', gulp.series('client', 'server:restart', 'watch'))
