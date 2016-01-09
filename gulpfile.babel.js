// Remove ianis.min.js

import childProcess from 'child_process';
import webpackStream from 'webpack-stream';
import libnotify from 'libnotify';
import merge from 'merge2';
import jade from 'jade';

// GULP
import livereload from 'gulp-livereload';
import gulpJade from 'gulp-jade';
import scssLint from 'gulp-scss-lint';
import plumber from 'gulp-plumber';
import uglify from 'gulp-uglify';
import concat from 'gulp-concat';
import eslint from 'gulp-eslint';
import watch from 'gulp-watch';
import shell from 'gulp-shell';
import chmod from 'gulp-chmod';
import less from 'gulp-less';
import sass from 'gulp-sass';
import mode from 'gulp-mode';
import gulp from 'gulp';
import scp from 'gulp-scp2';

// JSTransformer
import jsTransformer from 'jstransformer';
import katexTransformer from 'jstransformer-katex';
import highlightTransformer from 'jstransformer-highlight';

import WEBPACK_CONFIG from './webpack.config.js';

const PLUMBER_CONFIG = {
        errorHandler: function(error) {
            libnotify.notify(error.message, {
                title: 'Gulp error'
            });

            console.log(error.toString());
            this.emit('end');
        }
    },

    STYLE_GLOBS = [
        'node_modules/font-awesome/css/font-awesome.css',
        'node_modules/highlight.js/styles/monokai.css',
        'node_modules/katex/styles/monokai.css',
        'node_modules/skeleton-css/css/normalize.css',
        'node_modules/skeleton-css/css/skeleton.css',
        'client/styles/**/*.scss'
    ],

    katex = jsTransformer(katexTransformer),
    highlight = jsTransformer(highlightTransformer),
    runMode = mode();

let dub, app;

jade.filters.katex = function(input, config) {
    if (config.displayMode === undefined)
        config.displayMode = true;

    return katex.render(input, { displayMode: config.displayMode }).body;
};

jade.filters.highlight = function(input, config) {
    return highlight.render(input, { lang: config.lang }).body;
};

gulp.task('styles', function() {
    const
        katex = gulp.src('node_modules/katex/static/katex.less')
            .pipe(plumber(PLUMBER_CONFIG))
            .pipe(less())
            .pipe(chmod(644)),

        styles = gulp.src(STYLE_GLOBS)
            .pipe(plumber(PLUMBER_CONFIG))
            .pipe(sass({
                outputStyle: 'compressed',
                includePaths: [
                    'node_modules'
                ]
            }));

    return merge(katex, styles)
        .pipe(concat('application.css'))
        .pipe(gulp.dest('public/styles'))
        .pipe(runMode.development(livereload()));
});

gulp.task('webpack', function() {
    const polyfills = gulp.src([
            'node_modules/babel-polyfill/browser.js',
            'node_modules/whatwg-fetch/fetch.js',
            'node_modules/sugar/release/sugar-full.development.js',
            'node_modules/ianis.js/dist/ianis.min.js',
            'client/code/polyfills.js'
        ]),

        code = gulp.src('client/code/boot.js')
            .pipe(plumber(PLUMBER_CONFIG))
            .pipe(webpackStream(WEBPACK_CONFIG));

    return merge(polyfills, code)
        .pipe(concat('application.js'))
        .pipe(runMode.production(uglify()))
        .pipe(gulp.dest('public/code'))
        .pipe(runMode.development(livereload()));
});

gulp.task('views', function() {
    return gulp.src([
        'client/views/static/**/*.jade',
        '!client/views/static/**/_*.jade'
    ])
    .pipe(plumber(PLUMBER_CONFIG))
    .pipe(runMode.development(gulpJade({
        locals: { livereload: true, jade: jade }
    })))
    .pipe(runMode.production(gulpJade({ jade: jade })))
    .pipe(gulp.dest('views'))
    .pipe(runMode.development(livereload()));
});

['debug', 'release'].forEach(function(config) {
    gulp.task('dub:' + config, function(done) {
        if (dub) dub.kill();

        dub = childProcess.spawn('dub', ['build', '--build=' + config], { stdio: 'inherit' });
        dub.on('close', function(code) {
            done();

            if (code)
                libnotify.notify(`Return code ${code}`, {
                    title: 'Dub error'
                });
        });
    });
});

gulp.task('forex', shell.task('dub build --build release ivasilev:forex'));

gulp.task('server', ['dub:debug'], function(done) {
    if (app) app.kill();
    app = childProcess.spawn('./ivasilev', [], { stdio: 'inherit' });
    done();
});

gulp.task('watch', function() {
    livereload.listen();

    watch('server/**/*.d', function() {
        gulp.start('server');
    });

    watch('client/views/static/**/*.jade', function() {
        gulp.start('views');
    });

    watch(['client/code/**/*.js', 'client/views/**/*.jade', 'client/views/!static'], function() {
        gulp.start('webpack');
    });

    watch('client/styles/**/*.scss', function() {
        gulp.start('styles');
    });
});

gulp.task('lint:code', function() {
    return gulp.src('client/code/*.js')
        .pipe(eslint());
});

gulp.task('lint:styles', function() {
    return gulp.src('client/styles/*.scss')
        .pipe(scssLint());
});

gulp.task('lint', ['lint:code', 'lint:styles']);

// TODO: fix deploy
gulp.task('client', ['views', 'styles', 'webpack']);
gulp.task('default', ['server', 'views', 'watch']);
gulp.task('build', ['dub:release', 'forex', 'client']);
// gulp.task('scp', ['build'], function() {
//     return gulp.src(['config', 'views', 'public', 'dbconfig.yml', 'ivasilev', 'ivasilev_forex'])
//         .pipe(scp({
//             host: 'ivasilev.net',
//             dest: '/srv/http/ivasilev',
//             username: 'website',
//             password: 'veb'
//         }));
// });
