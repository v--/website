#!/usr/bin/env node

'use strict';

const SSH_SERVER = 'ivasilev.net',
    SSH_SERVER_ROOT = '/srv/http/ivasilev';

const livereload = require('gulp-livereload'),
    runSequence = require('run-sequence'),
    concat = require('gulp-concat'),
    shell = require('gulp-shell'),
    env = require('gulp-environments'),
    gulp = require('gulp');

const path = require('path');

function values(object) {
    let result = [];

    for (let key in object)
        result.push(object[key]);

    return result;
}

// Build
gulp.task('build:styles', function () {
    const sass = require('gulp-sass');

    return gulp.src('client/styles/**/*.scss')
        .pipe(sass({
            outputStyle: 'compressed',
            includePaths: [
                'node_modules'
            ]
        }))
        .pipe(concat('index.css'))
        .pipe(gulp.dest('public/styles'))
        .pipe(env.development(livereload()));
});

gulp.task('build:styles:katex', function () {
    const less = require('gulp-less'),
        chmod = require('gulp-chmod'),
        CleanCSS = require('less-plugin-clean-css');

    return gulp.src('node_modules/katex/static/katex.less')
        .pipe(less({
            plugins: [new CleanCSS({ advanced: true })]
        }))
        .pipe(chmod(644))
        .pipe(concat('katex.css'))
        .pipe(gulp.dest('public/styles'))
        .pipe(env.development(livereload()));
});

gulp.task('build:views', function () {
    const gulpJade = require('gulp-jade');
    const jade = require('./gulpfile.jade');

    return gulp.src([
            'client/views/static/**/*.jade',
            '!client/views/static/**/_*.jade'
        ])
        .pipe(gulpJade({
            locals: { jade: jade, production: env.production() === 'production' }
        }))
        .pipe(gulp.dest('views'))
        .pipe(env.development(livereload()));
});

gulp.task('build:icons', function () {
    const fs = require('fs'),
        svgstore = require('gulp-svgstore'),
        rename = require('gulp-rename');

    const icons = JSON.parse(fs.readFileSync('./client/icons/icons.json', 'utf-8'));

    return gulp.src(values(icons).map(icon => `${icon}.svg`), { 'cwd': 'client/icons/**' })
        .pipe(rename(function (path) {
            const full = `${path.dirname}/${path.basename}`;
            path.dirname = '.';

            for (let key in icons) {
                if (icons[key] === full) {
                    path.basename = key;
                    break;
                }
            }
        }))
        .pipe(svgstore())
        .pipe(rename('icons.svg'))
        .pipe(gulp.dest('public/images'))
        .pipe(env.development(livereload()));
});

gulp.task('build:code', function (callback) {
    const webpack = require('webpack'),
        config = env.production() ? require('./webpack.config.prod.js') : require('./webpack.config.dev.js');

    webpack(config).run(function (error, stats) {
        if (error)
            throw error; // eslint-disable-line no-console
        if (stats.toJson().errors.length)
            throw stats.toJson().errors;
        else
            console.log(stats.toString({ chunkModules: false, colors: true })); // eslint-disable-line no-console

        callback();
    });
});

gulp.task('build:server', function () {
    return gulp.src('dub.sdl', { read: false }) // Mock file
        .pipe(env.development(shell('dub build', { verbose: true })))
        .pipe(env.production(shell('dub build -b release', { verbose: true })));
});

gulp.task('build:forex', function () {
    return gulp.src('dub.sdl', { read: false }) // Mock file
        .pipe(env.development(shell('dub build ivasilev:forex', { verbose: true })))
        .pipe(env.production(shell('dub build ivasilev:forex -b release', { verbose: true })));
});

// Misc
gulp.task('dev-server', function (_callback) {
    const request = require('request'),
        express = require('express'),
        webpack = require('webpack'),
        middleware = require('webpack-dev-middleware');

    const webpackConfig = require('./webpack.config.dev.js');

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

gulp.task('productionize', function () {
    env.current(env.production);
});

// Deploy
gulp.task('productionize', function () {
    env.current(env.production);
});

gulp.task('deploy:views', ['productionize', 'build:views'], function () {
    const rsync = require('gulp-rsync');

    return gulp.src('views')
        .pipe(rsync({
            root: 'views',
            hostname: SSH_SERVER,
            destination: path.join(SSH_SERVER_ROOT, 'views'),
            recursive: true,
            clean: true
        }));
});

gulp.task('deploy:client', ['deploy:views', 'build:styles', 'build:styles:katex', 'build:icons', 'build:code'], function () {
    const rsync = require('gulp-rsync');

    return gulp.src('public')
        .pipe(rsync({
            root: 'public',
            hostname: SSH_SERVER,
            destination: path.join(SSH_SERVER_ROOT, 'public'),
            recursive: true,
            clean: true
        }));
});

gulp.task('deploy:server:stop', shell.task(`ssh ${SSH_SERVER} systemctl stop ivasilev.service`));
gulp.task('deploy:server:start', shell.task([
    `sleep 1`,
    `ssh ${SSH_SERVER} systemctl daemon-reload`,
    `ssh ${SSH_SERVER} systemctl start ivasilev.service`
]));

gulp.task('deploy:server:rsync', function () {
    const rsync = require('gulp-rsync');

    return gulp.src([
            'config/*.example',
            'ivasilev',
            'ivasilev.forex'
        ])
        .pipe(rsync({
            hostname: SSH_SERVER,
            destination: SSH_SERVER_ROOT
        }));
});

gulp.task('deploy:server', ['productionize'], function (callback) {
    runSequence(['build:forex', 'build:server', 'deploy:server:stop', 'deploy:server:rsync', 'deploy:server:start'], callback);
});

// Bundles
gulp.task('deploy', ['deploy:server', 'deploy:client']);
