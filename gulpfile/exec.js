import child_process from 'child_process'

const exec = (cmd, cb) => child_process.exec(cmd, (err, stdout, stderr) => {
  if (err) {
    console.log(stdout.trim())
    console.error(stderr.trim())
  }
  cb(err)
})

export default exec

