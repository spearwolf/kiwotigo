let worker;
let lastBuild;
let publishChannel;
const config = {
  idPrefix: "kiwotigo-",
  broadcastChannelName: "kiwotigo",
  kiwotigoWorkerUrl: "kiwotigo.worker.js",
  kiwotigoWasmUrl: "kiwotigo.wasm"
};
export const configure = (newConfig) => {
  if (newConfig.kiwotigoWasmUrl) {
    config.kiwotigoWasmUrl = newConfig.kiwotigoWasmUrl;
  }
  if (newConfig.broadcastChannelName) {
    const hasAlreadyBeenStarted = !!publishChannel;
    if (hasAlreadyBeenStarted && config.broadcastChannelName !== newConfig.broadcastChannelName) {
      publishChannel.close();
      publishChannel = null;
    }
    config.broadcastChannelName = newConfig.broadcastChannelName;
    if (hasAlreadyBeenStarted) {
      startBroadcasting();
    }
  }
  if (newConfig.kiwotigoWorkerUrl) {
    if (worker && config.kiwotigoWorkerUrl !== newConfig.kiwotigoWorkerUrl) {
      worker.terminate();
      worker = null;
      console.warn(
        "A worker has already been initialized. It will now be terminated. To avoid this behavior, simply call the configure() function before the first build() call"
      );
    }
    config.kiwotigoWorkerUrl = newConfig.kiwotigoWorkerUrl;
  }
};
export const startBroadcasting = () => {
  if (!publishChannel && typeof BroadcastChannel !== "undefined") {
    publishChannel = new BroadcastChannel(config.broadcastChannelName);
    publishChannel.onmessage = ({ data }) => {
      if (data) {
        switch (data.type) {
          case "publishBuild":
            if (lastBuild) {
              publishChannel.postMessage(lastBuild);
            }
            break;
          case "ping":
            publishChannel.postMessage({ type: "pong" });
            break;
        }
      }
    };
    if (lastBuild) {
      publishChannel.postMessage(lastBuild);
    }
  }
};
const tmpResolvers = /* @__PURE__ */ new Map();
const createMessageId = /* @__PURE__ */ (() => {
  let lastId = 0;
  return () => {
    ++lastId;
    return `${config.idPrefix}${lastId.toString(36)}`;
  };
})();
const initWorker = () => {
  worker = new Worker(config.kiwotigoWorkerUrl);
  worker.postMessage({ kiwotigoWasmUrl: config.kiwotigoWasmUrl });
  worker.onmessage = ({ data }) => {
    const { id, type } = data;
    const resolve = tmpResolvers.get(id);
    if (resolve) {
      switch (type) {
        case "progress":
          if (resolve.onProgressFn) {
            resolve.onProgressFn(data.progress);
          }
          break;
        case "result":
          tmpResolvers.delete(id);
          delete data.type;
          if (data.originData) {
            localStorage.setItem(
              "kiwotigoOriginData",
              typeof data.originData === "string" ? data.originData : JSON.stringify(data.originData)
            );
          }
          resolve.resolve(data);
          if (publishChannel) {
            lastBuild = { type: "build", data };
            publishChannel.postMessage(lastBuild);
          }
          break;
        default:
          console.warn("unknown message type:", type, data);
      }
    }
  };
};
const getWorker = () => {
  if (!worker) {
    initWorker();
  }
  return worker;
};
export const build = (config2, onProgressFn) => new Promise((resolve) => {
  const id = createMessageId();
  tmpResolvers.set(id, { resolve, onProgressFn });
  getWorker().postMessage({ ...config2, id });
});
