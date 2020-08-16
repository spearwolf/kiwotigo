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

export function watchTool() {
  watch(
    [
      './*.go',
      './kiwotigo-tool/*.go',
    ],
    {
      ignoreInitial: false,
    },
    buildTool,
  )
}

export function watchWasm() {
  watch(
    [
      './*.go',
      './kiwotigo-js-bridge/*.go',
    ],
    {
      ignoreInitial: false,
    },
    buildWasm,
  )
}

export function watchAll() {
  watch(
    './**/*.go',
    {
      ignoreInitial: false,
    },
    buildAll,
  )
}

export default series(clean, buildAll)
