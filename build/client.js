const concat = require('gulp-concat');
const source = require('vinyl-source-stream');
const sass = require('gulp-sass');
const svgo = require('gulp-svgo');
const gulp = require('gulp');
const env = require('gulp-environments');
const SVGO = require('svgo');

const { rollup } = require('rollup');

const rollupConfigFactory = require('./rollup_config_factory');

gulp.task('client:assets', function () {
    return gulp.src('client/assets/**/*')
        .pipe(gulp.dest('public'));
});

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
        .pipe(gulp.dest('public/styles'));
});

gulp.task('client:svgs', function () {
    return gulp.src('client/svgs/**/*.svg')
        .pipe(svgo())
        .pipe(gulp.dest('public/images'));
});

gulp.task('client:icons', async function () {
    const iconNames = require('../client/icons.json');
    const svgo = new SVGO({
        plugins: [{
            cleanupIDs: false,
            removeUselessDefs: false
        }]
    });

    const icons = iconNames.map(function (name) {
        const path = `<path d="${require(`mdi-svg/d/${name}`)}"></path>`;
        return `<symbol id="${name}">${path}</symbol>`;
    });

    const svg = `<svg xmlns="http://www.w3.org/2000/svg">${icons.join('\n')}</svg>`;
    const file = await svgo.optimize(svg);
    const stream = source('icons.svg');

    stream.write(file.data);
    stream.end();

    return stream.pipe(gulp.dest('public/images'));
});

{
    const bundles = ['core'];
    const cache = new Map();

    gulp.task('client:code', function () {
        return Promise.all(bundles.map(function (bundle) {
            const entry = `code/client/${bundle}/index.js`;

            const writeConfig = {
                format: 'iife',
                sourceMap: true,
                indent: false,
                moduleName: `modules.${bundle}`,
                dest: `public/code/${bundle}.js`
            };

            const rollupConfig = rollupConfigFactory(entry, env.production(), cache.get(bundle));

            return rollup(rollupConfig)
                .then(function (rollupBundle) {
                    cache.set(bundle, rollupBundle);
                    return rollupBundle.write(writeConfig);
                });
        }));
    });
}

gulp.task('client', gulp.parallel(
    'client:assets',
    'client:styles',
    'client:svgs',
    'client:icons',
    'client:code'
));
