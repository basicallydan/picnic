var gulp = require('gulp');
var sass = require('gulp-sass');
var gutil = require('gulp-util');
var browserify = require('browserify');
var through2 = require('through2');
var fs = require('fs');
var environment = 'live';
var watch = false;

if (gutil.env.watch) {
	watch = true;
}

gulp.task('styles', function() {
	return gulp.src('./scss/*.scss')
		.pipe(sass({
			watch: true
		}))
		.pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('browserify', function() {
	return gulp.src('./public/javascripts/src/main.js')
		.pipe(through2.obj(function(file, enc, next) {
			browserify(file.path, {
					globals: ['$', 'Backbone', '_'],
					debug: true
				})
				.transform(require('babelify'))
				.bundle(function(err, res) {
					if (err) {
						return next(err);
					}

					file.contents = res;
					next(null, file);
				});
		}))
		.on('error', function(error) {
			console.log(error.stack);
			this.emit('end');
		})
		.pipe(require('gulp-rename')('bundle.js'))
		.pipe(gulp.dest('./public/javascripts'));
});

gulp.task('watch-styles', function() {
	gulp.watch('./scss/*.scss', ['styles']);
});

gulp.task('watch-scripts', function() {
	gulp.watch(['./public/javascripts/*.js', './public/javascripts/**/*.js', './public/javascripts/src/**/*.js', '!./public/javascripts/bundle.js'], ['browserify']);
});

gulp.task('build', ['styles', 'browserify']);

gulp.task('default', ['build', 'watch-styles', 'watch-scripts']);