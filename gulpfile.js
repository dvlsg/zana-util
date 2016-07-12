"use strict";

const gulp     = require('gulp');
const mocha    = require('gulp-mocha');
const eslint   = require('gulp-eslint');
const del      = require('del');
const sequence = require('run-sequence');

const srcDir = './src/';
const srcGlob = srcDir + '*.js';

const distDir = './dist/';

const testDir = './test/';
const testGlob = testDir + '*.spec.js';

gulp.task('lint', () => {
  return gulp.src(srcGlob)
    .pipe(eslint()) // config in .eslintrc
    .pipe(eslint.format());
});

gulp.task('test', () => {
  return gulp.src(testGlob)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(mocha({ reporter: 'spec' }));
});

gulp.task('clean', (done) => {
  return del([ distDir ], done);
});

gulp.task('build', () => {
  // todo: wipe the build phase entirely,
  // now that babel is gone.
  return gulp.src(srcGlob)
    .pipe(gulp.dest(distDir));
});

gulp.task('watch', () => {
  gulp.watch(srcGlob, () => {
    sequence(
      'lint',
      'build'
    );
  });
  gulp.watch(testGlob, ['test']);
});

gulp.task('default', (done) => {
  sequence(
    'test',
    'clean',
    'lint',
    'build',
    'watch',
    done
  );
});
