#!/usr/bin/env node

import gulp from 'gulp';
import livereload from 'gulp-livereload';

import './build/gulpfile.client.js';
import './build/gulpfile.server.js';
import armor from './build/gulpfile.armor.js';

gulp.task('reload', function (done) {
    livereload.reload();
    done();
});

gulp.task('watch', function (done) {
    livereload.listen();

    gulp.watch('client/styles/**/*.scss', armor(gulp.series('client:styles', 'reload')));
    gulp.watch('client/static_views/**/*.pug', armor(gulp.series('client:views', 'reload')));
    gulp.watch('client/icons/**/*.svg', armor(gulp.series('client:icons', 'reload')));
    gulp.watch('client/images/**/*.svg', armor(gulp.series('client:images', 'reload')));
    gulp.watch('client/assets/**/*.svg', armor(gulp.series('client:assets', 'reload')));
    gulp.watch(`client/code/**/*.js`, armor(gulp.series(`client:code`, 'reload')));

    process.on('SIGINT', function () {
        done();
        process.exit();
    });
});

gulp.task('build', gulp.parallel('server', 'client'));
gulp.task('default', gulp.series(armor(gulp.series('build')), 'watch'));
