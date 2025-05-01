import './wasm_exec.js';

let kiwotigoWasmUrl = 'kiwotigo.wasm';

let __kiwotiGo;

export function init(wasmUrl) {
  if (__kiwotiGo) {
    return __kiwotiGo;
  }
  if (wasmUrl) {
    kiwotigoWasmUrl = wasmUrl;
  }
  const go = new Go();
  __kiwotiGo = WebAssembly.instantiateStreaming(fetch(kiwotigoWasmUrl), go.importObject).then((result) => {
    go.run(result.instance);
  });
  return __kiwotiGo;
}

export const DefaultConfig = {
  gridWidth: 5, //10,
  gridHeight: 5, //10,
  gridOuterPaddingX: 80, //25,
  gridOuterPaddingY: 80, //25,
  gridInnerPaddingX: 15, //6,
  gridInnerPaddingY: 15, //3,
  gridHexWidth: 15, //16,
  gridHexHeight: 15, //14,
  hexWidth: 10, //12, //24,
  hexHeight: 10, //12,
  hexPaddingX: 0, //5,  //3,
  hexPaddingY: 0, //5,  //3,
  fastGrowIterations: 5, //8, //10,
  minimalGrowIterations: 20, //120, //48,
  maxRegionSizeFactor: 3,
  probabilityCreateRegionAt: 0.5, //0.6,
  divisibilityBy: 1,
};

export function createContinent(cfg, onProgress) {
  return init().then(() => {
    onProgress(0.1);
    return new Promise((resolve) => {
      __kiwotiGo_createContinent(
        {
          ...DefaultConfig,
          ...cfg,
        },
        (progress) => {
          onProgress(0.1 + progress * 0.7);
        },
        (result) => {
          onProgress(0.8);
          const json = JSON.parse(result);
          onProgress(0.9);
          resolve(json);
        },
      );
    });
  });
}
