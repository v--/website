/* eslint-env node */

const gulp = require('gulp')
const livereload = require('gulp-livereload')

require('./build/client')
require('./build/server')
const armor = require('./build/armor')

gulp.task('reload', function (done) {
    livereload.reload()
    done()
})

gulp.task('watch', function (done) {
    livereload.listen({ port: 3001 })

    gulp.watch('client/styles/**/*.scss', armor(gulp.series('client:styles', 'reload')))
    gulp.watch('client/assets/**/*', armor(gulp.series('client:assets', 'reload')))
    gulp.watch('client/svgs/**/*.svg', armor(gulp.series('client:svgs', 'reload')))
    gulp.watch('client/icons.json', armor(gulp.series('client:icons', 'reload')))

    gulp.watch('code/client/**/*.js', armor(gulp.series('client:code', 'reload')))
    gulp.watch('code/server/**/*.js', armor(gulp.series('server:restart')))
    gulp.watch('code/common/**/*.js', armor(gulp.series('server:restart', 'client:code', 'reload')))

    process.on('SIGINT', function () {
        done()
        process.exit()
    })
})

gulp.task('build', gulp.parallel('server:build', 'client'))
gulp.task('default', gulp.series(armor(gulp.parallel('server:restart', 'client')), 'watch'))
