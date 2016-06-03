const gulp = require('gulp'),
	notify = require('gulp-notify'),
	stylus = require('gulp-stylus'),
	nib = require('nib'),
	plumber = require('gulp-plumber'),
	config = require('./config/configDev.json'),
	browserify = require('browserify'),
	path = require('path'),
	fs = require('fs')

function compileStyl () {
	gulp
	.src(config.gulp.srcStyle)
	.pipe(plumber())
	.pipe(stylus({use: nib(),compress: false}))
	.pipe(gulp.dest(config.gulp.dest))
	.pipe(notify({title : 'Stylus',message: 'Compile Stylus'}))
}

function transpilateJS (file){

	var nameFile = path.basename(file.path)
	console.log(config.browserify.path + nameFile)

	//return browserify(config.browserify.path + nameFile)
	return browserify({debug: true,entries:config.browserify.path + nameFile})
		.transform("babelify", {sourceMaps:true,presets: ["es2015"]})
		.bundle()
		.pipe(notify({title : 'JavaScript',message: 'Transpile JavaScript'}))
		.pipe(fs.createWriteStream(config.browserify.dest + nameFile))
}

gulp.task('default', () => {
	gulp.watch(config.gulp.srcStylus).on('change',compileStyl)//.on('added',compileStyl)
	gulp.watch(config.browserify.src).on('change',transpilateJS)//.on('added',transpilateJS)
})

compileStyl()
