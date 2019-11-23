import less from 'gulp-less'
import svgo from 'gulp-svgo'
import gulp from 'gulp'

import { sync } from './sync.js'
import { getMDIcons } from './md_icons.js'

gulp.task('client:build:svgs', function () {
  return gulp.src('client/svgs/**/*.svg')
    .pipe(svgo())
    .pipe(gulp.dest('public/images'))
    .pipe(sync.stream())
})

gulp.task('client:build:assets', function () {
  return gulp.src('client/assets/**/*')
    .pipe(gulp.dest('public/'))
    .pipe(sync.stream())
})

gulp.task('client:build:styles', function () {
  return gulp.src('client/styles/**/index.less')
    .pipe(less())
    .pipe(gulp.dest('public/styles'))
    .pipe(sync.stream())
})

gulp.task('client:build:icons', async function () {
  return getMDIcons({
    iconsFile: 'client/icons.json',
    outputFile: 'icons.json'
  }).pipe(gulp.dest('public'))
    .pipe(sync.stream())
})

gulp.task('client:restart', function (done) {
  sync.reload()
  done()
})

gulp.task('client:build', gulp.parallel(
  'client:build:assets',
  'client:build:svgs',
  'client:build:styles',
  'client:build:icons'
))
