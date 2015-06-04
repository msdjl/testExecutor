var gulp = require('gulp'),
	jade = require('gulp-jade'),
	del = require('del');

gulp.task('jade', function() {
	gulp.src(['./html/popup.jade', './html/buttons.jade'])
		.pipe(jade({
			pretty: true
		}))
		.on('error', console.log)
		.pipe(gulp.dest('./html/'));
});

gulp.task('dist', function() {
	del(['dist/*'], function () {
		gulp.src(['./html/*.html'])
			.pipe(gulp.dest('dist/html'));
		gulp.src(['css/*'])
			.pipe(gulp.dest('dist/css'));
		gulp.src(['img/*'])
			.pipe(gulp.dest('dist/img'));
		gulp.src(['js/*'])
			.pipe(gulp.dest('dist/js'));
		gulp.src(['manifest.json'])
			.pipe(gulp.dest('dist'));
		gulp.src(['bower/bootstrap/dist/**/*'])
			.pipe(gulp.dest('dist/bower/bootstrap/dist'));
		gulp.src(['bower/html2canvas/build/*'])
			.pipe(gulp.dest('dist/bower/html2canvas/build'));
		gulp.src(['bower/jquery/dist/*'])
			.pipe(gulp.dest('dist/bower/jquery/dist'));
	});
});

gulp.task('default', ['jade', 'dist']);