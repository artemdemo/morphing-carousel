var gulp = require('gulp'),
    less = require('gulp-less'),
    watch = require('gulp-watch'),
    rename = require("gulp-rename"),
    concat = require('gulp-concat');

var LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    autoprefix= new LessPluginAutoPrefix({ browsers: ['last 2 versions'] });

gulp.task('scripts', function() {
    return gulp.src([
        './source/MorphCarousel.js'
    ])
        .pipe(concat('MorphCarousel.js'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('less', function () {
    gulp.src('./source/MorphCarousel.less')
        .pipe(less({
            plugins: [autoprefix]
        }).on('error', function(err){

            // Handle less errors, but do not stop watch task
            console.log('Less error:');
            console.log( 'filename:', err.filename );
            console.log( 'lineNumber:', err.lineNumber );
            console.log( 'extract:', err.extract.join(' ') );
            this.emit('end');
        }))
        .pipe(rename("MorphCarousel.css"))
        .pipe(gulp.dest('./dist'));
});

gulp.task('watch', function(){
    gulp.watch('source/**/*.js', ['scripts']);
    gulp.watch('source/**/*.less', ['less']);
});

gulp.task('default', ['scripts', 'less', 'watch']);