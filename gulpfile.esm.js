import {parallel, series, task} from 'gulp';
import './gulpfile/buildJsDemo';
import './gulpfile/buildWorker';
import exec from './gulpfile/exec';
import watchFiles from './gulpfile/watchFiles';

export const clean = (done) => exec('rimraf -f kiwotigo dist', done);

export const buildTool = (done) => exec('zx ./build-tool.mjs', done);
export const buildWasm = (done) => exec('zx ./build-wasm.mjs', done);

export const buildAll = parallel(buildTool, buildWasm, 'buildWorker', 'buildJsDemo');

export const watchTool = () => watchFiles(buildTool, './*.go', './kiwotigo-tool/*.go');
export const watchWasm = () => watchFiles(buildWasm, './*.go', './kiwotigo-js-bridge/*.go');

export const watchWorker = () =>
  watchFiles(
    task('buildWorker'),
    'kiwotigo.worker.mjs',
    'kiwotigo-wasm-bridge.mjs',
    'kiwotigo-unite-islands.mjs',
    'dist/kiwotigo.wasm',
  );

export const watchJsDemo = () => watchFiles(task('buildJsDemo'), 'kiwotigo.mjs', 'kiwotigo-demo.mjs', 'kiwotigo-painter.mjs');

export const watchAll = () => {
  watchTool();
  watchWasm();
  watchWorker();
  watchJsDemo();
};

export default series(clean, buildAll);
