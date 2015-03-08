var gulp = require('gulp');
var sass = require('gulp-sass');
var gutil = require('gulp-util');
var browserify = require('browserify');
// var watchify = require('watchify');
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
	var b = browserify({
		extensions: ['.json', '.hbs', '.handlebars'],
		debug: true,
		fullPaths: true
	});
	b.add('./public/javascripts/main.js');
	b.bundle().pipe(fs.createWriteStream('./public/javascripts/bundle.js'));
});

gulp.task('watch-styles', function () {
	gulp.watch('./scss/*.scss', ['styles']);
});

gulp.task('watch-scripts', function () {
	gulp.watch(['./public/javascripts/*.js', '!./public/javascripts/bundle.js'], ['browserify']);
});

gulp.task('build', ['styles', 'watch-styles', 'browserify', 'watch-scripts']);

gulp.task('default', ['build']);