const worker = new Worker('./kiwoticum-world-builder.worker.js', {type: 'module'})

worker.onmessage = (e) => {
  console.info('received message from worker, data=', e.data)
}

export const create = (cfg) => worker.postMessage(cfg);
