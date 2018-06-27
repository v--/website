import concat from 'gulp-concat'
import less from 'gulp-less'
import svgo from 'gulp-svgo'
import gulp from 'gulp'
import env from 'gulp-environments'

import rollup from 'rollup'

import rollupConfigFactory from './rollup_config_factory'
import { getMDIcons } from './md_icons'

const BUNDLES = ['core', 'sorting']

gulp.task('client:assets', function () {
  return gulp.src('client/assets/**/*')
    .pipe(gulp.dest('public'))
})

for (const bundle of BUNDLES) {
  gulp.task(`client:styles:${bundle}`, function () {
    return gulp.src(`client/styles/${bundle}/**/*.less`)
      .pipe(less())
      .pipe(concat(`${bundle}.css`))
      .pipe(gulp.dest('public/styles'))
  })
}

gulp.task('client:styles', gulp.parallel(...BUNDLES.map(bundle => `client:styles:${bundle}`)))

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
  const cache = new Map()

  gulp.task('client:code', function () {
    return Promise.all(BUNDLES.map(function (bundle) {
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
