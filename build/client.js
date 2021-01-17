import gulp from 'gulp'
import scss from 'gulp-dart-sass'
import svgo from 'gulp-svgo'
import ts from 'gulp-typescript'

import fs from 'fs/promises'

import { sync } from './sync.js'
import { getMDIcons } from './md_icons.js'

const tsConfig = JSON.parse(await fs.readFile('tsconfig.json', 'utf8'))
const tsProject = ts.createProject(tsConfig.compilerOptions)

gulp.task('client:build:code', function() {
  return gulp.src('code/{common,client}/**/*.{js,ts,d.ts}')
    .pipe(tsProject())
    .pipe(gulp.dest('dist'))
})

gulp.task('client:build:svgs', function() {
  return gulp.src('client/svgs/**/*.svg')
    .pipe(svgo())
    .pipe(gulp.dest('public/images'))
    .pipe(sync.stream())
})

gulp.task('client:build:assets', function() {
  return gulp.src('client/assets/**/*')
    .pipe(gulp.dest('public/'))
    .pipe(sync.stream())
})

gulp.task('client:build:styles', function() {
  return gulp.src('client/styles/**/index.scss')
    .pipe(scss({ outputStyle: 'compressed' }))
    .pipe(gulp.dest('public/styles'))
    .pipe(sync.stream())
})

gulp.task('client:build:icons', async function() {
  return getMDIcons({
    iconsFile: 'client/icons.json',
    outputFile: 'icons.json'
  }).pipe(gulp.dest('public'))
    .pipe(sync.stream())
})

gulp.task('client:restart', function(done) {
  sync.reload()
  done()
})

gulp.task('client:build', gulp.parallel(
  'client:build:code',
  'client:build:assets',
  'client:build:svgs',
  'client:build:styles',
  'client:build:icons'
))
