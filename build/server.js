import gulp from 'gulp'
import ts from 'gulp-typescript'

import fs from 'fs/promises'

import { Spawn } from './spawn.js'

const tsConfig = JSON.parse(await fs.readFile('tsconfig.json', 'utf8'))
const tsProject = ts.createProject(tsConfig.compilerOptions)

gulp.task('server:build', function() {
  return gulp.src('code/{common,client,types}/**/*.{js,ts,d.ts}')
    .pipe(tsProject())
    .pipe(gulp.dest('dist'))
})

const child = new Spawn('node', '--loader', 'ts-node/esm', 'code/server/index.ts')

gulp.task('server:restart', function() {
  return child.restart()
})

process.on('SIGINT', Spawn.prototype.kill.bind(child))
