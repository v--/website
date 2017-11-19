const concat = require('gulp-concat')
const sass = require('gulp-sass')
const svgo = require('gulp-svgo')
const gulp = require('gulp')
const env = require('gulp-environments')

const { rollup } = require('rollup')

const rollupConfigFactory = require('./rollup_config_factory')
const { getMDIcons } = require('./md_icons')

gulp.task('client:assets', function () {
    return gulp.src('client/assets/**/*')
        .pipe(gulp.dest('public'))
})

gulp.task('client:styles', function () {
    return gulp.src('client/styles/**/*.scss')
        .pipe(sass({
            outputStyle: 'compressed',
            includePaths: [
                'client/styles',
                'node_modules/skeleton-sass-official'
            ]
        }))
        .pipe(concat('index.css'))
        .pipe(gulp.dest('public/styles'))
})

gulp.task('client:svgs', function () {
    return gulp.src('client/svgs/**/*.svg')
        .pipe(svgo())
        .pipe(gulp.dest('public/images'))
})

gulp.task('client:icons', function () {
    return getMDIcons({
        icons: require('../client/icons.json'),
        fileName: 'icons.js'
    }).pipe(gulp.dest('code/common'))
})

{
    const bundles = ['core']
    const cache = new Map()

    gulp.task('client:code', function () {
        return Promise.all(bundles.map(function (bundle) {
            const entry = `code/client/${bundle}/index.js`

            const writeConfig = {
                format: 'iife',
                sourcemap: true,
                indent: false,
                name: `modules.${bundle}`,
                file: `public/code/${bundle}.js`
            }

            const rollupConfig = rollupConfigFactory(entry, env.production(), cache.get(bundle))

            return rollup(rollupConfig)
                .then(function (rollupBundle) {
                    cache.set(bundle, rollupBundle)
                    return rollupBundle.write(writeConfig)
                })
        }))
    })
}

gulp.task('client', gulp.parallel(
    'client:assets',
    'client:styles',
    'client:svgs',

    gulp.series(
        'client:icons',
        'client:code'
    )
))
