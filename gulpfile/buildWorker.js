const gulp = require('gulp')
const rollup = require('rollup')
const { terser } = require('rollup-plugin-terser')
const { babel } = require('@rollup/plugin-babel')

gulp.task('buildWorker', () =>
  rollup.rollup({
    input: './kiwotigo.worker.mjs',
    plugins: [
      babel({
        babelHelpers: 'bundled',
        presets: [
          '@babel/preset-env',
        ],
        exclude: [
          /wasm_exec\.js/,
        ],
      }),
    ]
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
