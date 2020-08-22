const worker = new Worker('./kiwotigo.worker.mjs', {type: 'module'})

const tmpResolvers = new Map()  // temporary id -> resolve: Promise.resolve(), onProgressFn

const createMessageId = (() => {
  let lastId = 0
  return () => {
    ++lastId
    return `kwb-${lastId.toString(36)}`
  }
})()

worker.onmessage = ({data}) => {
  const { id, type } = data
  const resolve = tmpResolvers.get(id)
  if (resolve) {
    switch (type) {
      case 'progress':
        if (resolve.onProgressFn) {
          resolve.onProgressFn(data.progress)
        }
        break

      case 'result':
        tmpResolvers.delete(id)
        delete data.type
        resolve.resolve(data)
        break

      default:
        console.warn('unknown message type:', type, data)
    }
  }
}

export const build = (cfg, onProgressFn) => new Promise(resolve => {
  const id = createMessageId()
  tmpResolvers.set(id, { resolve, onProgressFn })
  worker.postMessage({ ...cfg, id })
})
