import livereload from 'gulp-livereload';
import svgstore from 'gulp-svgstore';
import concat from 'gulp-concat';
import rename from 'gulp-rename';
import inline from 'gulp-inline-source';
import chmod from 'gulp-chmod';
import sass from 'gulp-sass';
import less from 'gulp-less';
import gulp from 'gulp';
import env from 'gulp-environments';
import pug from 'gulp-pug';

import CleanCSS from 'less-plugin-clean-css';
import { join as joinPath } from 'path';
import { rollup } from 'rollup';
import { exec } from 'child_process';

import pugAPI from './pug';
import rollupConfigFactory from './rollup.factory.js';

import bundles from './bundles.json';
import icons from '../client/icons/icons.json';

function invert(object) {
    const result = {};

    for (const key in object) {
        result[object[key]] = key;
    }

    return result;
}

function dubTask(project) {
    return function () {
        if (env.production())
            return exec(`dub build ${project}`);
        else
            return exec(`dub build ${project} --build release`);
    };
}

gulp.task('build:styles', function () {
    return gulp.src('client/styles/**/*.scss')
        .pipe(sass({
            outputStyle: 'compressed',
            includePaths: [
                'client/styles',
                'node_modules'
            ]
        }))
        .pipe(concat('index.css'))
        .pipe(gulp.dest('public/styles'))
        .pipe(env.development(livereload()));
});

gulp.task('build:styles:katex', function () {
    return gulp.src('node_modules/katex/static/katex.less')
        .pipe(less({
            plugins: [new CleanCSS({ advanced: true })]
        }))
        .pipe(chmod(644))
        .pipe(gulp.dest('public/styles'))
        .pipe(env.development(livereload()));
});

gulp.task('build:views', function () {
    return gulp.src([
            'client/static_views/**/*.pug',
            '!client/static_views/**/_*.pug'
        ])
        .pipe(pug({
            pug: pugAPI,
            locals: { production: env.production() }
        }))
        .pipe(inline({
            'rootpath': 'public/',
        }))
        .pipe(gulp.dest('views'))
        .pipe(env.development(livereload()));
});

gulp.task('build:icons', function () {
    const lookupIcons = invert(icons);
    const values = Object.keys(lookupIcons);

    return gulp.src(values.map(icon => `${icon}.svg`), { 'cwd': 'client/icons/**' })
        .pipe(rename(function (path) {
            const full = `${path.dirname}/${path.basename}`;
            path.basename = lookupIcons[full];
            path.dirname = '.';
        }))
        .pipe(svgstore())
        .pipe(rename('icons.svg'))
        .pipe(gulp.dest('public/images'))
        .pipe(env.development(livereload()));
});

bundles.forEach(function (bundle) {
    let cache;
    const writeConfig = {
        format: 'iife',
        sourceMap: true,
        moduleName: `modules.${bundle.name}`,
        globals: bundle.modules,
        dest: joinPath('public', 'code', `${bundle.name}.js`)
    };

    gulp.task(`build:code:${bundle.name}`, function () {
        return rollup(rollupConfigFactory(bundle.entry, bundle.modules, env.production(), cache))
            .then(function (bundle) {
                cache = bundle;
                return bundle.write(writeConfig);
            })
            .then(function () {
                livereload.reload();
            });
    });
});

gulp.task('build:code', gulp.series(bundles.map(bundle => `build:code:${bundle.name}`)));
gulp.task('build:server', dubTask('ivasilev'));
gulp.task('build:forex', dubTask('ivasilev:forex'));
