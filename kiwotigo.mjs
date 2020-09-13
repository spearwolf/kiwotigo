let worker

let lastBuild
let publishChannel

export const startBroadcasting = () => {
  if (!publishChannel && typeof BroadcastChannel !== 'undefined') {
    publishChannel = new BroadcastChannel('kiwotigo')
    publishChannel.onmessage = ({ data }) => {
      if (data) {
        switch (data.type) {
          case 'publishBuild':
            if (lastBuild) {
              publishChannel.postMessage(lastBuild)
            }
            break;
          case 'ping':
            publishChannel.postMessage({ type: 'pong' })
            break;
        }
      }
    }
    if (lastBuild) {
      publishChannel.postMessage(lastBuild)
    }
  }
}

const tmpResolvers = new Map()  // temporary id -> resolve: Promise.resolve(), onProgressFn

const createMessageId = (() => {
  let lastId = 0
  return () => {
    ++lastId
    return `kiwotigo-${lastId.toString(36)}`
  }
})()

const initWorker = () => {
  worker = new Worker('kiwotigo.worker.js')

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
          if (data.originData) {
            localStorage.setItem('kiwotigoOriginData',
              typeof data.originData === 'string'
                ? data.originData
                : JSON.stringify(data.originData)
            )
          }
          resolve.resolve(data)
          if (publishChannel) {
            lastBuild = { type: 'build', data }
            publishChannel.postMessage(lastBuild)
          }
          break

        default:
          console.warn('unknown message type:', type, data)
      }
    }
  }
}

const getWorker = () => {
  if (!worker) {
    initWorker()
  }
  return worker
}

export const build = (config, onProgressFn) => new Promise(resolve => {
  const id = createMessageId()
  tmpResolvers.set(id, { resolve, onProgressFn })
  getWorker().postMessage({ ...config, id })
})
