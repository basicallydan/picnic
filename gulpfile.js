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
	// var b = browserify({
	// 	extensions: ['.json', '.hbs', '.handlebars'],
	// 	debug: true,
	// 	fullPaths: true
	// });
	// b.add('./public/javascripts/src/main.js');
	// b.bundle().pipe(fs.createWriteStream('./public/javascripts/bundle.js'));
	return gulp.src('./public/javascripts/src/main.js')
		.pipe(through2.obj(function(file, enc, next) {
			browserify(file.path, {
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
	gulp.watch(['./public/javascripts/*.js', './public/javascripts/**/*.js', '!./public/javascripts/bundle.js'], ['browserify']);
});

gulp.task('build', ['styles', 'watch-styles', 'browserify', 'watch-scripts']);

gulp.task('default', ['build']);