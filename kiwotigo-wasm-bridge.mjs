import "./wasm_exec.js";

const go = new Go();
const __kiwotiGo = WebAssembly.instantiateStreaming(
  fetch("kiwotigo.wasm"),
  go.importObject
).then((result) => {
  go.run(result.instance);
});

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
  divisibilityBy: 1,
  probabilityCreateRegionAt: 0.5, //0.6,
};

export function createContinent(cfg, onProgress) {
  return __kiwotiGo.then(
    () => {
      onProgress(0.1)
      return new Promise((resolve) => {
        __kiwotiGo_createContinent(
          {
            ...DefaultConfig,
            ...cfg,
          },
          (progress) => {
            onProgress(0.1 + (progress * 0.7))
          },
          (result) => {
            onProgress(0.8)
            const json = JSON.parse(result)
            onProgress(0.9)
            resolve(json)
          }
        );
      })
    }
  );
}
