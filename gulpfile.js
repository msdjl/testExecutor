var gulp = require('gulp'),
	jade = require('gulp-jade');

gulp.task('jade', function() {
	gulp.src(['./html/popup.jade', './html/buttons.jade'])
		.pipe(jade({
			pretty: true
		}))
		.on('error', console.log)
		.pipe(gulp.dest('./html/'));
});
gulp.task('watch', function () {
	gulp.start('jade');
	gulp.watch('html/*.jade', function () {
		gulp.start('jade');
	});
});