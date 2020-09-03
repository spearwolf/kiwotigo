import { watch } from 'gulp'

const watchFiles = (task, ...files) => watch(files, { ignoreInitial: false }, task)

export default watchFiles
