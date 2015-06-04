var gulp = require('gulp'),
	jade = require('gulp-jade'),
	del = require('del');

gulp.task('dist', function() {
	del(['dist/*'], function () {
		gulp.src(['src/css/*'])
			.pipe(gulp.dest('dist/css'));
		gulp.src(['src/img/*'])
			.pipe(gulp.dest('dist/img'));
		gulp.src(['src/js/*'])
			.pipe(gulp.dest('dist/js'));
		gulp.src(['src/manifest.json'])
			.pipe(gulp.dest('dist'));

		gulp.src(['bower/bootstrap/dist/**/*min*', 'bower/bootstrap/dist/**/*.woff'])
			.pipe(gulp.dest('dist/bower/bootstrap/dist'));
		gulp.src(['bower/html2canvas/build/html2canvas.min.js'])
			.pipe(gulp.dest('dist/bower/html2canvas/build'));
		gulp.src(['bower/jquery/dist/jquery.min.js'])
			.pipe(gulp.dest('dist/bower/jquery/dist'));

		gulp.src(['src/html/popup.jade', 'src/html/buttons.jade'])
			.pipe(jade({
				pretty: true
			}))
			.on('error', console.log)
			.pipe(gulp.dest('dist/html'));
	});
});

gulp.task('default', ['dist']);