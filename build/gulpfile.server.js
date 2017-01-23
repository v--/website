import gulp from 'gulp';
import env from 'gulp-environments';

import { exec } from 'child_process';

gulp.task('server', function () {
    if (env.production())
        return exec('dub build ivasilev --build release');

    return exec('dub build ivasilev');
});
