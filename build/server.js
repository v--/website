import gulp from 'gulp'
import ts from 'gulp-typescript'

import fs from 'fs/promises'

const tsConfig = JSON.parse(await fs.readFile('tsconfig.json', 'utf8'))
const tsProject = ts.createProject(tsConfig.compilerOptions)

gulp.task('server:build', function() {
  return gulp.src('code/{common,server,types}/**/*.{js,ts,d.ts}')
    .pipe(tsProject())
    .pipe(gulp.dest('dist'))
})
