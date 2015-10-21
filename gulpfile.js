var gulp = require('gulp'),
    concat = require('gulp-concat'),
    gulpif = require('gulp-if'),
    browserify = require('browserify'),
    bower = require('bower-resolve'),
    uglify = require('gulp-uglify'),
    buffer = require('vinyl-buffer'),
    source = require('vinyl-source-stream'),
    minifyCss = require('gulp-minify-css'),
    _ = require('lodash');


function getBowerPackageIds() {
    // read bower.json and get dependencies' package ids
    var bowerManifest = {};
    try {
        bowerManifest = require('./bower.json');
    } catch (e) {
        // does not have a bower.json manifest
    }
    return _.keys(bowerManifest.dependencies) || [];
}

gulp.task('default', ['minify']);

gulp.task('minify', function() {
    gulp.src('./public/stylesheets/*')
        .pipe(gulpif('*.css', minifyCss({compatibility: 'ie8'})))
        .pipe(concat('style.min.css'))
        .pipe(gulp.dest('./public/css/'));

    var b = browserify(['./public/javascripts/app.js'], {debug: true} );
    getBowerPackageIds().forEach(function(id) {
        var resolvedPath = bower.fastReadSync(id);
        b.require(resolvedPath, { expose: id });
    });

    return b.bundle()
    .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('./public/js/'));
});