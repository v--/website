const gulp = require('gulp')

const Fork = require('./fork')

gulp.task('server:build', function () {
    return gulp.src('server/**/*.js')
        .pipe(gulp.dest('dist/server'))
})

{
    const child = new Fork('code/server/index', {
        env: {
            NODE_PATH: 'code/'
        }
    })

    gulp.task('server:restart', function () {
        return child.restart()
    })

    process.on('SIGINT', Fork.prototype.kill.bind(child))
}
