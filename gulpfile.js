/* eslint-env node */

const gulp = require('gulp')

require('./build/client')
require('./build/server')
const armor = require('./build/armor')

gulp.task('watch', function (done) {
    gulp.watch('client/styles/**/*.scss', armor(gulp.series('client:styles')))
    gulp.watch('client/assets/**/*', armor(gulp.series('client:assets')))
    gulp.watch('client/svgs/**/*.svg', armor(gulp.series('client:svgs')))
    gulp.watch('client/icons.json', armor(gulp.series('client:icons', 'server:restart', 'client:code')))

    gulp.watch('code/client/**/*.js', armor(gulp.series('client:code')))
    gulp.watch('code/server/**/*.js', armor(gulp.series('server:restart')))
    gulp.watch('code/common/**/*.js', armor(gulp.series('server:restart', 'client:code')))

    process.on('SIGINT', function () {
        done()
        process.exit()
    })
})

gulp.task('build', gulp.parallel('server:build', 'client'))
gulp.task('default', armor(gulp.series('client', 'server:restart', 'watch')))
