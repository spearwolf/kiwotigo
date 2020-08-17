import { createContinent } from './kiwotigo-wasm-bridge.mjs'

console.log('hej kiwotigo 🦄')

self.onmessage = (e) => {
  const { id, ...cfg } = e.data
  createContinent(cfg).then(result => Object.assign(result, { id })).then(postMessage)
  // TODO add post processing
  // TODO post progress events
}
