const { execSync } = require('child_process');

const gulp = require('gulp');

gulp.task('server:build', function (done) {
    // TODO: Add build process
    done();
});

gulp.task('server:restart', function (done) {
    // HACK: Manually restarting node.js turned out to be a nightmare.
    execSync('systemctl --user restart ivasilev:server.service');
    done();
});
