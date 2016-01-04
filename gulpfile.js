var gulp = require('gulp'),
    concat = require('gulp-concat'),
    gulpif = require('gulp-if'),
    browserify = require('browserify'),
    uglify = require('gulp-uglify'),
    buffer = require('vinyl-buffer'),
    source = require('vinyl-source-stream'),
    nano = require('gulp-cssnano');


gulp.task('default', ['minify']);

gulp.task('minify', function() {
    gulp.src('./public/stylesheets/*')
        .pipe(gulpif('*.css', nano()))
        .pipe(concat('style.min.css'))
        .pipe(gulp.dest('./public/css/'));

    var b = browserify(['./public/javascripts/app.js'], {debug: true} );

    return b.bundle()
    .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('./public/js/'));
});