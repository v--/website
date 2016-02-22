#!/usr/bin/env node

'use strict';

const concat = require('gulp-concat'),
    gulp = require('gulp');

gulp.task('styles', function () {
    const sass = require('gulp-sass');

    return gulp.src('client/styles/**/*.scss')
        .pipe(sass({
            outputStyle: 'compressed',
            includePaths: [
                'node_modules'
            ]
        }))
        .pipe(concat('index.css'))
        .pipe(gulp.dest('public/styles'));
});

gulp.task('styles:katex', function () {
    const less = require('gulp-less'),
        chmod = require('gulp-chmod'),
        CleanCSS = require('less-plugin-clean-css');

    return gulp.src('node_modules/katex/static/katex.less')
        .pipe(less({
            plugins: [new CleanCSS({ advanced: true })]
        }))
        .pipe(chmod(644))
        .pipe(concat('katex.css'))
        .pipe(gulp.dest('public/styles'));
});

gulp.task('views', function () {
    const gulpJade = require('gulp-jade');
    const jade = require('./gulpfile.jade');

    return gulp.src([
            'client/views/static/**/*.jade',
            '!client/views/static/**/_*.jade'
        ])
        .pipe(gulpJade({
            locals: { jade: jade, production: process.env.NODE_ENV === 'production' }
        }))
        .pipe(gulp.dest('views'));
});

gulp.task('server', function (_callback) {
    const fs = require('fs'),
        path = require('path'),
        request = require('request'),
        express = require('express'),
        webpack = require('webpack'),
        middleware = require('webpack-dev-middleware');

    const webpackConfig = require('./webpack.config.js');

    const app = express(),
        compiler = webpack(webpackConfig);

    app.use(middleware(compiler, {
        noInfo: true,
        publicPath: webpackConfig.output.publicPath
    }));

    app.get('*', function (req, res) {
        request(`http://localhost:8000${req.url}`).pipe(res);
    });

    app.listen(8001);
});

