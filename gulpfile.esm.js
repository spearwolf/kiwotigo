import { series, parallel, task } from 'gulp'
import exec from './gulpfile/exec'
import watchFiles from './gulpfile/watchFiles'
import './gulpfile/buildWorker'
import './gulpfile/buildJsDemo'

export const clean = (done) => exec('rm -fr kiwotigo dist', done)

export const buildTool = (done) => exec('bash ./build.sh', done)
export const buildWasm = (done) => exec('bash ./build.sh -wasm', done)

export const buildAll = parallel(buildTool, buildWasm, 'buildWorker')

export const watchTool = () => watchFiles(buildTool, './*.go', './kiwotigo-tool/*.go')
export const watchWasm = () => watchFiles(buildWasm, './*.go', './kiwotigo-js-bridge/*.go')

export const watchWorker = () => watchFiles(task('buildWorker'),
  'kiwotigo.worker.mjs',
  'kiwotigo-wasm-bridge.mjs',
  'kiwotigo-unite-islands.mjs',
  'dist/kiwotigo.wasm'
)

export const watchJsDemo = () => watchFiles(task('buildJsDemo'),
  'kiwotigo.mjs',
  'kiwotigo-demo.mjs',
  'kiwotigo-painter.mjs',
)

export const watchAll = () => {
  watchTool();
  watchWasm();
  watchWorker();
  watchJsDemo();
}

export default series(clean, buildAll)
