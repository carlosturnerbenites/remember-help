var gulp = require('gulp')
,uglify = require('gulp-uglify')
,notify = require("gulp-notify")
,stylus = require('gulp-stylus')
,nib = require('nib')
,colors = require('colors')
,config = require("./config/configDev.json")

function compileStyl(file) {
	gulp
	.src(config.gulp.srcStyle)
	.pipe(stylus({use: nib(),compress: true}))
	.pipe(gulp.dest(config.gulp.dest))
	.pipe(notify({title : "Stylus",message: "Compile Stylus"}))
}

gulp.task('default', () => {
	gulp.watch(config.gulp.srcStylus).on('change',compileStyl).on('added',compileStyl)
	});
