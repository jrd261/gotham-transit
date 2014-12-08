var gulp = require('gulp');
var rename = require('gulp-rename');
var stylus = require('gulp-stylus');
var clean = require('gulp-clean');
var zip = require('gulp-zip');

gulp.task('copy-bower-components', function(){
	return gulp.src('bower_components/**/*.min.*')
	.pipe(rename(function(path){path.dirname = '';}))
	.pipe(gulp.dest('build/public'))
});

gulp.task('copy-node-components', function(){
	return gulp.src(['views/*', 'app.js', 'package.json'], {base: './'})
	.pipe(gulp.dest('build'));
});

gulp.task('copy-static-components', function(){
	return gulp.src('static/**')
	.pipe(gulp.dest('build/public'));
});

gulp.task('copy-node-modules', function(){
	return gulp.src('node_modules/*', {base: './'})
	.pipe(gulp.dest('build'));
});

gulp.task('copy-javascript-components', function(){
	return gulp.src('javascript/**/*.js')
	.pipe(gulp.dest('build/public'))
});

gulp.task('copy-stylesheet-components', function(){
	return gulp.src('stylesheets/**/*.stylus')
	.pipe(stylus())
	.pipe(gulp.dest('build/public'))
});

gulp.task('clean', function(){
	return gulp.src('build/**')
	.pipe(clean());
});

gulp.task('copy-configuration-development', function(){
	return gulp.src('config.development.json')
	.pipe(rename('config.json'))
	.pipe(gulp.dest('build/'));
});

gulp.task('copy-configuration-production', function(){
	return gulp.src('config.production.json')
	.pipe(rename('config.json'))
	.pipe(gulp.dest('build/'));
});

gulp.task('zip-build', function(){
	return gulp.src('build/**')
	.pipe(zip('build.zip'))
	.pipe(gulp.dest('./'));
});

gulp.task('default', function() {
  gulp.watch('javascript/**/*.js', ['copy-javascript-components']);
  gulp.watch('stylesheets/**/*.stylus', ['copy-stylesheet-components']);
  gulp.watch('views/**/*.jade', ['copy-node-components']);
  gulp.watch('config.development.json', ['copy-configuration-development']);
  gulp.watch(['views/**/*', 'app.js'], ['copy-node-components']);

});

gulp.task('build-development', [
	'copy-bower-components',
	'copy-static-components',
	'copy-node-components',
	'copy-node-modules',
	'copy-stylesheet-components',
	'copy-javascript-components',
	'copy-configuration-development',
	]);

gulp.task('build-production', [
	'copy-bower-components',
	'copy-static-components',
	'copy-node-components',
	'copy-stylesheet-components',
	'copy-javascript-components',
	'copy-configuration-production',
	]);