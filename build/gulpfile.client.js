const livereload = require('gulp-livereload');
const svgstore = require('gulp-svgstore');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const chmod = require('gulp-chmod');
const svgo = require('gulp-svgo');
const sass = require('gulp-sass');
const less = require('gulp-less');
const gulp = require('gulp');
const env = require('gulp-environments');
const pug = require('gulp-pug');

const CleanCSS = require('less-plugin-clean-css');
const { join: joinPath, basename } = require('path');
const { rollup } = require('rollup');

const pugAPI = require('./pug');
const rollupConfigFactory = require('./rollup.factory.js');

const bundles = require('./bundles.json');
const icons = require('../client/icons/icons.json');

const iconLookup = new Map(Object.entries(icons).map(([key, value]) => [value, key]));
const iconFiles = Array.from(iconLookup.keys()).map(icon => `${icon}.svg`);

gulp.task('client:styles', function () {
    return gulp.src('client/styles/**/*.scss')
        .pipe(sass({
            outputStyle: 'compressed',
            includePaths: [
                'client/styles',
                'node_modules'
            ]
        }))
        .pipe(concat('index.css'))
        .pipe(gulp.dest('dist/public/styles'));
});

gulp.task('client:styles:katex', function () {
    return gulp.src('node_modules/katex/static/katex.less')
        .pipe(less({
            plugins: [new CleanCSS({ advanced: true })]
        }))
        .pipe(chmod(644))
        .pipe(gulp.dest('dist/public/styles'));
});

gulp.task('client:views', function () {
    return gulp.src([
            'client/static_views/**/*.pug',
            '!client/static_views/**/_*.pug'
        ])
        .pipe(pug({
            pug: pugAPI,
            locals: { production: env.production() }
        }))
        .pipe(gulp.dest('dist/views'));
});

gulp.task('client:icons', function () {
    return gulp.src(iconFiles, { 'cwd': 'client/icons/**' }) // Do not touch this glob
        .pipe(rename(function (path) {
            const full = joinPath(basename(path.dirname), path.basename);
            path.basename = iconLookup.get(full);
            path.dirname = '.';
        }))
        .pipe(svgstore())
        .pipe(rename('icons.svg'))
        .pipe(svgo({
            plugins: [{
                cleanupIDs: false,
                removeUselessDefs: false
            }]
        }))
        .pipe(gulp.dest('dist/public/images'));
});

gulp.task('client:images', function () {
    return gulp.src('client/images/**/*.svg')
        .pipe(svgo())
        .pipe(gulp.dest('dist/public/images'));
});

gulp.task('client:assets', function () {
    return gulp.src('client/assets/**/*')
        .pipe(gulp.dest('dist/public'));
});

for (const bundle of bundles) {
    let cache;
    const writeConfig = {
        format: 'iife',
        sourceMap: true,
        moduleName: `modules.${bundle.name}`,
        globals: bundle.modules,
        dest: joinPath('dist/public', 'code', `${bundle.name}.js`)
    };

    gulp.task(`client:code:${bundle.name}`, function () {
        return rollup(rollupConfigFactory(bundle.entry, bundle.modules, env.production(), cache))
            .then(function (bundle) {
                cache = bundle;
                return bundle.write(writeConfig);
            })
            .then(function () {
                livereload.reload();
            });
    });
}

gulp.task('client:code', gulp.series(bundles.map(bundle => `client:code:${bundle.name}`)));

gulp.task('client', gulp.parallel(
    'client:styles:katex',
    'client:styles',
    'client:views',
    'client:icons',
    'client:images',
    'client:assets',
    'client:code'
));
