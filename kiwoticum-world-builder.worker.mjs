import { createContinent } from './kiwotigo.mjs'

console.log('hej kiwoticum-world-builder.js 🦄')

self.onmessage = (e) => {
  const { id, ...cfg } = e.data
  createContinent(cfg).then(result => Object.assign(result, { id })).then(postMessage)
  // TODO add post processing
  // TODO post progress events
}
