const gulp = require('gulp'),
	notify = require('gulp-notify'),
	stylus = require('gulp-stylus'),
	nib = require('nib'),
	plumber = require('gulp-plumber'),
	config = require('./config/configDev.json')
	browserify = require('gulp-browserify')

function compileStyl () {
	gulp
	.src(config.gulp.srcStyle)
	.pipe(plumber())
	.pipe(stylus({use: nib(),compress: false}))
	.pipe(gulp.dest(config.gulp.dest))
	.pipe(notify({title : 'Stylus',message: 'Compile Stylus'}))
}

function transpilateJS (){
	gulp.src(config.browserify.src)
	.pipe(browserify({transform: ['babelify'],}))
	.pipe(gulp.dest(config.browserify.dest))

}

gulp.task('default', () => {
	gulp.watch(config.gulp.srcStylus).on('change',compileStyl).on('added',compileStyl)
	gulp.watch(config.browserify.src).on('change',transpilateJS).on('added',transpilateJS)
})

compileStyl()
