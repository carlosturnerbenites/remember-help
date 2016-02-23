const gulp = require('gulp'),
	notify = require('gulp-notify'),
	stylus = require('gulp-stylus'),
	nib = require('nib'),
	config = require('./config/configDev.json')

function compileStyl() {
	gulp
	.src(config.gulp.srcStyle)
	.pipe(stylus({use: nib(),compress: true}))
	.pipe(gulp.dest(config.gulp.dest))
	.pipe(notify({title : 'Stylus',message: 'Compile Stylus'}))
}

gulp.task('default', () => {
	gulp.watch(config.gulp.srcStylus).on('change',compileStyl).on('added',compileStyl)
})
