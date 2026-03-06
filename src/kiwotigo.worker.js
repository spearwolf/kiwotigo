import {init} from './kiwotigo-wasm-bridge.js';
import {buildContinent} from './kiwotigo.core.js';

const _postProgress = (id) => (progress) => postMessage({id, progress, type: 'progress'});

self.onmessage = async (e) => {
  if (e.data?.kiwotigoWasmUrl) {
    init(e.data.kiwotigoWasmUrl);
    return;
  }

  const {id, originData, ...data} = e.data;
  const postProgress = _postProgress(id);

  try {
    const result = await buildContinent(data, originData, postProgress);
    postMessage({...result, id, type: 'result'});
  } catch (err) {
    console.error('kiwotigo post-processing panic!', err);
    postMessage({
      id,
      type: 'error',
      message: err.message || String(err),
      stack: err.stack,
    });
  }
};
