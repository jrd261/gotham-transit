var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var stylus = require('gulp-stylus');
var clean = require('gulp-clean');

gulp.task('copy-bower-components', function(){
	return gulp.src('bower_components/**/*.min.*')
	.pipe(rename(function(path){path.dirname = '';}))
	.pipe(gulp.dest('build/public'))
});

gulp.task('copy-node-components', function(){
	return gulp.src(['node_modules/*', 'models/*', 'views/*', 'controllers/*', 'routes/*', 'app.js'], {base: './'})
	.pipe(gulp.dest('build'));
});

gulp.task('copy-static-components', function(){
	return gulp.src('static/**')
	.pipe(gulp.dest('build/public'));
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

// Watch Our Files
gulp.task('watch', function() {
  gulp.watch('javascript/**/*.js', ['copy-javascript-components']);
  gulp.watch('stylesheets/**/*.stylus', ['copy-stylesheet-components']);
  gulp.watch('views/**/*.jade', ['copy-node-components']);

  gulp.watch(
  	['models/**/*', 'views/**/*', 'controllers/**/*', 'routes/**/*', 'app.js'], ['copy-node-components'])
});

gulp.task('clean', function(){
	return gulp.src('build/**')
	.pipe(clean());
});

// Default
gulp.task('default', [
	'copy-bower-components', 
	'copy-node-components',
	'copy-static-components',
	'copy-javascript-components',
	'copy-stylesheet-components',
	]);


