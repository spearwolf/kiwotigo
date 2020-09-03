const gulp = require('gulp')
const rollup = require('rollup')
const { terser } = require('rollup-plugin-terser')

gulp.task('buildWorker', () =>
  rollup.rollup({
    input: './kiwotigo.worker.mjs',
  }).then(bundle => bundle.write({
    file: './dist/kiwotigo.worker.js',
    format: 'iife',
    name: 'kiwotigo',
    sourcemap: true,
    plugins: [
      terser(),
    ],
  }))
)
