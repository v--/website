import rsync from 'gulp-rsync';
import gulp from 'gulp';
import env from 'gulp-environments';

import './gulpfile.build.js';
import { join as joinPath } from 'path';
import { exec } from 'child_process';

const SSH_SERVER = 'ivasilev.net';
const SSH_SERVER_ROOT = '/srv/http/ivasilev';

function shellTask(...args) {
    return function shellTask() {
        return exec(...args);
    };
}

gulp.task('productionize', function (done) {
    env.current(env.production);
    done();
});

gulp.task('deploy:client:rsync', function () {
    return gulp.src([
            'public/**/*',
            'views/**/*'
        ])
        .pipe(rsync({
            incremental: true,
            root: '.',
            hostname: SSH_SERVER,
            destination: joinPath(SSH_SERVER_ROOT),
            recursive: true,
            links: false,
            options: {
                'copy-links': true
            }
        }));
});

gulp.task('deploy:client', gulp.series(
    'productionize',
    gulp.parallel(
        'build:views',
        'build:styles',
        'build:styles:katex',
        'build:icons',
        'build:code'
    ),
    'deploy:client:rsync'
));

gulp.task('deploy:server:stop',
    shellTask(`ssh ${SSH_SERVER} systemctl stop ivasilev.service`)
);

gulp.task('deploy:server:start', gulp.series(
    shellTask(`ssh ${SSH_SERVER} systemctl daemon-reload`),
    shellTask(`ssh ${SSH_SERVER} systemctl start ivasilev.service`)
));

gulp.task('deploy:server:rsync', function () {
    return gulp.src([
            'config/*.example',
            'ivasilev',
            'ivasilev.forex'
        ])
        .pipe(rsync({
            incremental: true,
            hostname: SSH_SERVER,
            destination: SSH_SERVER_ROOT
        }));
});

gulp.task('deploy:server', gulp.series(
    'productionize',
    'build:forex',
    'build:server',
    'deploy:server:stop',
    'deploy:server:rsync',
    'deploy:server:start'
));

gulp.task('deploy', gulp.series('deploy:server', 'deploy:client'));
