var mainBowerFiles = require('main-bower-files'),
    childProcess = require('child_process'),
    ngAnnotate = require('gulp-ng-annotate'),
    ngTemplate = require('gulp-ng-template'),
    livereload = require('gulp-livereload'),
    removeCode = require('gulp-remove-code'),
    minifyCss = require('gulp-minify-css'),
    libnotify = require('libnotify'),
    plumber = require('gulp-plumber'),
    babel = require('gulp-babel'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    dedupe = require('gulp-dedupe'),
    filter = require('gulp-filter'),
    watch = require('gulp-watch'),
    merge = require('gulp-merge'),
    newer = require('gulp-newer'),
    sass = require('gulp-sass'),
    jade = require('gulp-jade'),
    gulp = require('gulp'),
    fs = require('fs'),

    plumberArg = {
        errorHandler: function(error) {
            libnotify.notify(error.message, {
               title: 'Gulp error'
           });

            console.log(error.toString());
            this.emit('end');
        }
    },

    dub, app;

require('sugar');

function filterStyles(files) {
    return files.filter(function(file) {
        return /\.css$/.test(file);
    });
}

function filterScripts(files) {
    return files.filter(function(file) {
        return /\.js$/.test(file);
    }).sort(function(file) {
        var result = file.endsWith('angular.min.js') || file.endsWith('d3.js');
        return !result * 2 - 1;
    });
}

gulp.task('css', function() {
    var libs = gulp.src(filterStyles(mainBowerFiles()));

    var styles = gulp.src('app/styles/**/*.scss')
        .pipe(plumber(plumberArg))
        .pipe(sass({
            includePaths: [
                'bower_components/bourbon/app/assets/stylesheets',
                'bower_components/mdi/scss',
                'bower_components/lumx/libs/mdi/scss/'
            ]
        }));

    return merge(libs, styles)
        .pipe(concat('application.css'))
        .pipe(gulp.dest('public/styles'))
        .pipe(livereload());
});

gulp.task('js-new', function() {
    return gulp.src('app/scripts/**/*.js')
        .pipe(plumber(plumberArg))
        .pipe(newer('/tmp/gulp/ivas'))
        .pipe(babel())
        .pipe(ngAnnotate())
        .pipe(gulp.dest('/tmp/gulp/ivas'));
});

gulp.task('js', ['js-new'], function() {
    var libs = gulp.src(filterScripts(mainBowerFiles()));

    var scripts = gulp.src([
        '/tmp/gulp/ivas/boot.js',
        '/tmp/gulp/ivas/**/*.js'
    ])
    .pipe(dedupe())
    .pipe(filter(function(input) {
        return fs.existsSync(input.path.replace('/tmp/gulp/ivas', 'app/scripts'));
    }));

    var templates = gulp.src('app/views/**/*.jade')
        .pipe(plumber(plumberArg))
        .pipe(jade())
        .pipe(ngTemplate({
            moduleName: 'templates',
            standalone: true
        }));

    return merge(libs, templates, scripts)
        .pipe(concat('application.js'))
        .pipe(gulp.dest('public/scripts'))
        .pipe(livereload());
});

gulp.task('css-prod', ['css'], function() {
    return gulp.src('public/application.css')
        .pipe(minifyCss())
        .pipe(gulp.dest('public'));
});

gulp.task('js-prod', ['js'], function() {
    return gulp.src('public/application.js')
        .pipe(removeCode({
            production: true,
            commentStart: '// '
        }))
        .pipe(uglify())
        .pipe(gulp.dest('public'));
});

gulp.task('views:static', function() {
    return gulp.src([
            'views/**/*.jade',
            '!views/**/_*.jade'
        ])
        .pipe(jade())
        .pipe(gulp.dest('html'))
        .pipe(livereload());
});

gulp.task('dub', function(done) {
    if (dub) dub.kill();

    dub = childProcess.spawn('dub', ['build'], { stdio: 'inherit' });
    dub.on('close', function(code) {
        done();
        if (code) return;
        if (app) app.kill();
        app = childProcess.spawn('./ivasilev', [], { stdio: 'inherit' });
    });
});

gulp.task('watch', function() {
    livereload.listen();

    watch('source/**/*.d', function() {
        gulp.start('dub');
    });

    watch('views/**/*.jade', function() {
        gulp.start('views:static');
    });

    watch([
        'app/scripts/**/*.js',
        'app/views/**/*.jade'
    ], function() {
        gulp.start('js');
    });

    watch('app/styles/**/*.scss', function() {
        gulp.start('css');
    });
});

gulp.task('default', ['views:static', 'css', 'js', 'dub', 'watch']);
gulp.task('prod', ['views:static', 'css-prod', 'js-prod']);
