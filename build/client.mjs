import concat from 'gulp-concat'
import sass from 'gulp-sass'
import svgo from 'gulp-svgo'
import gulp from 'gulp'
import env from 'gulp-environments'

import rollup from 'rollup'

import rollupConfigFactory from './rollup_config_factory'
import { getMDIcons } from './md_icons'

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

gulp.task('client:icons', async function () {
    return getMDIcons({
        iconsFile: 'client/icons.json',
        outputFile: 'icons.mjs'
    }).pipe(gulp.dest('code/common'))
})

{
    const bundles = ['core']
    const cache = new Map()

    gulp.task('client:code', function () {
        return Promise.all(bundles.map(function (bundle) {
            const input = `code/client/${bundle}/index.mjs`

            const writeConfig = {
                format: 'iife',
                sourcemap: true,
                indent: false,
                name: `modules.${bundle}`,
                file: `public/code/${bundle}.js`
            }

            const rollupConfig = rollupConfigFactory(input, env.production(), cache.get(bundle))

            return rollup.rollup(rollupConfig)
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
