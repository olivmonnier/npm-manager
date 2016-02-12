var gulp = require('gulp');
var browserify = require('gulp-browser').browserify;
var sass = require('gulp-sass');
var server = require('gulp-express');
var concat = require('gulp-concat');

gulp.task('concat:vendor', function() {
  return gulp.src([
    './node_modules/jquery/dist/jquery.js',
    './node_modules/bootstrap-sass/assets/javascripts/bootstrap.js',
    './node_modules/lodash/lodash.js',
    './node_modules/bootstrap-treeview/src/js/bootstrap-treeview.js'
  ])
    .pipe(concat('build.js'))
    .pipe(gulp.dest('./public/vendor/'));
});

gulp.task('build:js', function() {
  return gulp.src('./public/src/js/app.js')
    .pipe(browserify())
    .pipe(gulp.dest('./public/dist/'));
});

gulp.task('sass', function () {
  return gulp.src('./public/src/sass/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/dist/'));
});

gulp.task('server', ['concat:vendor'], function () {
    server.run(['app.js']);

    // Restart the server when file changes
    gulp.watch(['./views/**/*.jade'], server.notify);
    gulp.watch(['./public/src/sass/**/*.scss'], ['sass']);

    gulp.watch(['./public/src/js/*.js'], ['build:js']);
    gulp.watch(['app.js', 'routes/**/*.js'], [server.run]);
});
