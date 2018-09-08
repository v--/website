import sourcemaps from 'gulp-sourcemaps'
import replace from 'gulp-replace'
import rename from 'gulp-rename'
import concat from 'gulp-concat'
import terser from 'gulp-uglify-es'
import less from 'gulp-less'
import svgo from 'gulp-svgo'
import gulp from 'gulp'

import sync from './sync.mjs'
import { getMDIcons } from './md_icons.mjs'
import rmdir from './rmdir.mjs'

gulp.task('client:assets', function () {
  return gulp.src('client/assets/**/*')
    .pipe(gulp.dest('public'))
})

gulp.task('client:styles', function () {
  return gulp.src('client/styles/**/*.less')
    .pipe(less())
    .pipe(concat('index.css'))
    .pipe(gulp.dest('public/styles'))
    .pipe(sync.stream())
})

gulp.task('client:svgs', function () {
  return gulp.src('client/svgs/**/*.svg')
    .pipe(svgo())
    .pipe(gulp.dest('public/images'))
    .pipe(sync.stream())
})

gulp.task('client:code:_clean', function () {
  return rmdir('public/code')
})

gulp.task('client:code:_icons', async function () {
  return getMDIcons({
    iconsFile: 'client/icons.json',
    outputFile: 'icons.mjs'
  }).pipe(gulp.dest('code/common'))
})

gulp.task('client:code:_build', function () {
  // Much tooling, including gulp-sourcemaps, refuses to work with mjs files, so we rename them to js
  return gulp.src('code/{client,common}/**/*.mjs')
    .pipe(rename({ extname: '.js' }))
    .pipe(replace(/(import|from) '([a-z_./]+)'/g, "$1 '$2.js'"))
    // .pipe(sourcemaps.init())
    // .pipe(terser.default())
    // .pipe(sourcemaps.write('.', { sourceRoot: '.' }))
    .pipe(gulp.dest('public/code'))
})

gulp.task('client:code:_reload', function (done) {
  sync.reload()
  done()
})

gulp.task('client:code', gulp.series(
  'client:code:_icons',
  'client:code:_clean',
  'client:code:_build',
  'client:code:_reload'
))

gulp.task('client', gulp.parallel(
  'client:assets',
  'client:styles',
  'client:svgs',
  'client:code'
))
