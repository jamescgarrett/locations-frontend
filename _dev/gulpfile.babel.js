'use strict';

import config from './gulp-conf';

import gulp from 'gulp';
import eslint from 'gulp-eslint';
import uglify from 'gulp-uglify';
import sourcemaps from 'gulp-sourcemaps';
import notify from 'gulp-notify';
import clean from 'gulp-clean';
import gulpif from 'gulp-if';
import plumber from 'gulp-plumber';

import babelify from 'babelify';
import browserify from 'browserify';
import runSequence from 'run-sequence';
import watchify from 'watchify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';

/*
 * esLint
 * task: lint
 */
gulp.task('lint', () => {
    gulp.src(config.jsAll)
        .pipe(eslint())
        .pipe(eslint.format());
});

/*
 * Browserify
 * task: browserify
 */
gulp.task('browserify', () => {
    browserify(config.jsEntry, {extensions: ['.js', '.json', '.jsx'], debug: true})
        .transform(babelify)
        .bundle()
        .pipe(source(config.jsBundle))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.jsDist));
});

/*
 * Watchify
 * task: watchify
 */
const customOptions = {
    entries: config.jsEntry,
    extensions: ['.js', '.json', '.jsx'],
    debug: true
};
const options = Object.assign({}, watchify.args, customOptions);

gulp.task('watchify', () => {
    let bundler = watchify(browserify(options));
    function rebundle() {
        return bundler.bundle()
            .on('error', notify.onError())
            .pipe(source(config.jsBundle))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(config.jsDist))
            .pipe(notify('javascript compilation complete.'));
    }
    bundler.transform(babelify)
        .on('update', rebundle);
    return rebundle();
});




/*
 * Clean
 * task: clean
 */
gulp.task('clean', () => {
    return gulp.src([config.jsDist], {read: false})
        .pipe(clean({force:true}));
});

/*
 * Build
 * task: build
 */
gulp.task('build', cb => {
    process.env.NODE_ENV = 'production';
    runSequence('clean', ['browserify'], cb);
});

/*
 * Watch Task
 * task: watchTask
 * task: watch
 */
gulp.task('watchTask', () => {
    gulp.watch(config.jsAll, ['lint']);
});
gulp.task('watch', cb => {
    runSequence('clean', ['watchTask', 'watchify', 'lint'], cb);
});

/*
 * Default
 * default task: css, browserify
 */
gulp.task('default', [ 'browserify' ]);
