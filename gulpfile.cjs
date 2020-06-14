const gulp = require('gulp')

const { armor } = require('./build/armor.cjs')
const { sync } = require('./build/sync.cjs')
require('./build/client.cjs')
require('./build/server.cjs')

gulp.task('watch', function (done) {
  gulp.watch('client/styles/**/*.scss', armor(gulp.series('client:build:styles')))
  gulp.watch('client/assets/**/*', armor(gulp.series('client:build:assets')))
  gulp.watch('client/svgs/**/*.svg', armor(gulp.series('client:build:svgs')))
  gulp.watch('client/icons.json', armor(gulp.series('client:build:icons', 'server:restart')))

  gulp.watch('code/server/**/*.js', armor(gulp.series('server:restart')))
  gulp.watch('code/client/**/*.js', armor(gulp.series('client:restart')))
  gulp.watch('code/common/**/*.js', armor(gulp.parallel('server:restart', 'client:restart')))

  sync.init()

  process.on('SIGINT', function () {
    done()
    sync.destruct()
    process.exit() // eslint-disable-line no-process-exit
  })
})

gulp.task('default', gulp.series('client:build', 'server:restart', 'watch'))
