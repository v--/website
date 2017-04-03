const { fork } = require('child_process');

const gulp = require('gulp');

gulp.task('server:build', function () {
    return gulp.src('server/**/*.js')
        .pipe(gulp.dest('dist/server'));
});

{
    let child;

    gulp.task('server:restart', function (done) {
        new Promise(resolve => {
            if (child) {
                child.on('exit', resolve);
                child.kill();
            } else {
                resolve();
            }
        }).then(function () {
            child = fork('server/index');
            child.on('exit', function () {
                child = null;
            });

            done();
        });
    });
}
