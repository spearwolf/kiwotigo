import { createContinent } from './kiwotigo.mjs'

console.log('hej kiwoticum-world-builder.js 🦄')

self.onmessage = (e) => {
  console.debug('worker received a message, data=', e.data)
  createContinent(e.data).then(postMessage)
}
