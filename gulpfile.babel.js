#!/usr/bin/env node

import gulp from 'gulp';
import livereload from 'gulp-livereload';

import './build/gulpfile.build.js';
import './build/gulpfile.deploy.js';
import armor from './build/gulpfile.armor.js';

gulp.task('start', function (done) {
    livereload.listen();

    gulp.watch('client/static_views/**/*.jade', armor(gulp.series('build:views')));
    gulp.watch('client/styles/**/*.scss', armor(gulp.series('build:styles')));
    gulp.watch('client/views/**/*.jade', armor(gulp.series('build:code')));
    gulp.watch(`client/code/**/*.js`, armor(gulp.series(`build:code`)));

    process.on('SIGINT', function () {
        done();
        process.exit();
    });
});

gulp.task('default', gulp.series('build:views', 'build:code', 'build:styles', 'start'));
