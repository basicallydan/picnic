var gulp = require('gulp');
var sass = require('gulp-sass');
var gutil = require('gulp-util');
var browserify = require('browserify');
var watchify = require('watchify');
var environment = 'live';
var watch = false;

if (gutil.env.watch) {
	watch = true;
}

gulp.task('styles', function() {
	return gulp.src('./scss/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('browserify', function() {
	var b = browserify({
		entries: './public/javascripts/main.js',
		dest: './public/javascripts',
		outputName: 'bundle.js',
		extensions: ['.json', '.hbs', '.handlebars'],
		debug: true,
		cache: {},
		packageCache: {},
		fullPaths: true
	});

	if (watch === true) {
		b = watchify(b);
		b.on('update', function () {
			gutil.log('Rebuilding JavaScripts');
			b.bundle();
		});
	}

	b.bundle();
});

gulp.task('build', ['styles', 'browserify']);

gulp.task('default', ['build']);