const gulp = require('gulp')
const rollup = require('rollup')
const { babel } = require('@rollup/plugin-babel')
const { terser } = require('rollup-plugin-terser')

gulp.task('buildJsDemo', () =>
  rollup.rollup({
    input: './kiwotigo-demo.mjs',
    plugins: [
      babel({
        babelHelpers: 'bundled',
        presets: [
          '@babel/preset-env',
        ],
      }),
    ]
  }).then(bundle => bundle.write({
    file: './dist/kiwotigo-demo.js',
    format: 'iife',
    name: 'kiwotigoDemo',
    sourcemap: true,
    plugins: [
      terser(),
    ],
  }))
)
