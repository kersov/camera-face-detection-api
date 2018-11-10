'use strict';
var gulp = require('gulp');
var fileinclude = require('gulp-file-include');
var autoprefixer = require('gulp-autoprefixer');
var compass = require('gulp-compass');
var pack = require('./package');
var watch = require('gulp-watch');
var runSequence = require('run-sequence');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var svg2png = require('gulp-svg2png');
var buffer = require('vinyl-buffer');
var csso = require('gulp-csso');
var imagemin = require('gulp-imagemin');
var merge = require('merge-stream');
var spritesmith = require('gulp.spritesmith');
var htmlmin = require('gulp-htmlmin');

/* BAKE ***********************************************************************/
gulp.task('bake', function() {
  gulp.src([pack.config.bake.inputFiles])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest(pack.paths.html.temp));
});

gulp.task('bake-watch', function () {
  return watch(pack.config.bake.inputFiles, {ignoreInitial: true}, function () {
    runSequence('bake', 'htmlmin');
  });
});
/******************************************************************************/

/* SASS ***********************************************************************/
gulp.task('compass', function () {
  return gulp
    .src(pack.config.sass.inputFiles)
    .pipe(compass({
      sass: pack.paths.sass.input,
      css: pack.paths.sass.temp,
      logging: false,
      comments: false,
      style: 'expanded'
    }))
});

gulp.task('sass', ['compass'], function () {
  return gulp
    .src(pack.config.sass.tempFiles)
    .pipe(autoprefixer())
    .pipe(cleanCSS(pack.config.cleanCSS))
    .pipe(gulp.dest(pack.paths.sass.output));
});

gulp.task('sass-watch', function () {
  return watch(pack.paths.sass.input, { ignoreInitial: true }, function () {
    runSequence('sass', 'bake');
  });
});
/******************************************************************************/

/* JS *************************************************************************/
gulp.task('uglify-js', function (cb) {
  return gulp
    .src(pack.config.js.inputFiles)
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(pack.paths.js.output));

});

gulp.task('js-watch', function () {
  return watch(pack.config.js.inputFiles, { ignoreInitial: true }, function () {
    runSequence('uglify-js', 'bake');
  });
});
/******************************************************************************/

/* IMAGES *********************************************************************/
gulp.task('icons2png', function () {
    return gulp.src(pack.config.icons.inputFiles)
      .pipe(svg2png(pack.config.icons.options))
      .pipe(gulp.dest(pack.paths.icons.output));
});

gulp.task('sprite', function () {
  // Generate our spritesheet
  var spriteData = gulp.src(pack.config.sprite.inputFiles).pipe(spritesmith({
    imgName: pack.config.sprite.imgName,
    cssName: pack.config.sprite.cssName,
    padding: 25
  }));

  // Pipe image stream through image optimizer and onto disk
  var imgStream = spriteData.img
    // DEV: We must buffer our stream into a Buffer for `imagemin`
    .pipe(buffer())
    .pipe(imagemin())
    .pipe(gulp.dest(pack.config.sprite.imgOutputDir));

  // Pipe CSS stream through CSS optimizer and onto disk
  var cssStream = spriteData.css
    .pipe(csso())
    .pipe(rename({ extname: '.scss' }))
    .pipe(gulp.dest(pack.config.sprite.cssOutputDir));

  // Return a merged stream to handle both `end` events
  return merge(imgStream, cssStream);
});

gulp.task('img', function () {
  runSequence('icons2png', 'sprite');
});
/******************************************************************************/

/* HTMLMIN ********************************************************************/
gulp.task('htmlmin', function() {
  return gulp.src(pack.paths.html.temp + 'index.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(pack.paths.base));
});
/******************************************************************************/

/* GENERAL ********************************************************************/

gulp.task('watch', ['sass-watch', 'bake-watch', 'js-watch']);

gulp.task('build', function () {
  runSequence('img', 'sass', 'uglify-js', 'bake', 'htmlmin');
});

gulp.task('default', function () {
  runSequence('build', 'watch');
});
/******************************************************************************/
