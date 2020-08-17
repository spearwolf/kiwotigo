const worker = new Worker('./kiwotigo.worker.mjs', {type: 'module'})

const tmpResolvers = new Map()  // temporary id -> Promise.resolve()

const createMessageId = (() => {
  let lastId = 0
  return () => {
    ++lastId
    return `kwb-${lastId.toString(36)}`
  }
})()

worker.onmessage = ({data}) => {
  const { id } = data
  const resolve = tmpResolvers.get(id)
  if (resolve) {
    tmpResolvers.delete(id)
    resolve(data)
  }
}

export const build = (cfg) => new Promise(resolve => {
  const id = createMessageId()
  tmpResolvers.set(id, resolve)
  worker.postMessage({ ...cfg, id })
})
