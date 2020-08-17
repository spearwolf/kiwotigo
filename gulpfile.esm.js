import { watch, series, parallel } from 'gulp'
import child_process from 'child_process'

const exec = (cmd, cb) => child_process.exec(cmd, (err, stdout, stderr) => {
  if (err) {
    console.log(stdout.trim())
    console.error(stderr.trim())
  }
  cb(err)
})

export const clean = (done) => exec('rm -fr kiwotigo kiwotigo.wasm', done)

export const buildTool = (done) => exec('bash ./build.sh', done)
export const buildWasm = (done) => exec('bash ./build.sh -wasm', done)
export const buildAll = parallel(buildTool, buildWasm)

const watchFiles = (task, ...files) => watch(files, { ignoreInitial: false }, task)

export const watchTool = () => watchFiles(buildTool, './*.go', './kiwotigo-tool/*.go')
export const watchWasm = () => watchFiles(buildWasm, './*.go', './kiwotigo-js-bridge/*.go')
export const watchAll = () => watchFiles(buildAll, './**/*.go')

export default series(clean, buildAll)
