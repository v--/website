import { fork } from 'child_process';

import gulp from 'gulp';

gulp.task('server:build', function (done) {
    // TODO: Add build process
    done();
});

{
    let pid = null;

    gulp.task('server:restart', function (done) {
        if (pid !== null) {
            pid.kill();
        }

        pid = fork('server/index', { execPath: '/usr/bin/babel-node' });

        done();
    });
}
