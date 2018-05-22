var gulp = require('gulp');
var stylus = require('gulp-stylus');
var pug = require('gulp-pug');
const babel = require('gulp-babel');

var path = {
    stylus : ['stylus/*.styl'],
    css : 'public/static/css/'
};

gulp.task('css', function () {
    return gulp.src('frontend/src/stylus/*.styl')
      .pipe(stylus({
          compress : false
      }))
      .pipe(gulp.dest('public/static/css/'));
  });

gulp.task('html', function (){
    return gulp.src('frontend/src/pug/*.pug')
    .pipe(pug({pretty: true}))
    .pipe(gulp.dest('public/static/html/'));
})


gulp.task('js', function () {
    return gulp.src('frontend/src/js/*.js')
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(gulp.dest('public/static/js/dist/'));
})

gulp.task('watch', function (){
    gulp.watch('frontend/src/stylus/*.styl', ['css']);
    gulp.watch('frontend/src/pug/*.pug', ['html']);
    gulp.watch('frontend/src/js/*.js', ['js']);
})


