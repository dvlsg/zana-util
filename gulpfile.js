"use strict";

const gulp     = require('gulp');
const mocha    = require('gulp-mocha');
const eslint   = require('gulp-eslint');
const del      = require('del');
const sequence = require('run-sequence');

const srcDir = './src/';
const srcGlob = srcDir + '*.js';

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

gulp.task('watch', () => {
  gulp.watch(srcGlob, [ 'lint', 'test' ]);
  gulp.watch(testGlob, ['test']);
});

gulp.task('default', (done) => {
  sequence(
    'test',
    'lint',
    'watch',
    done
  );
});
