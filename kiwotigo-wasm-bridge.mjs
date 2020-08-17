import "./wasm_exec.js";

const go = new Go();
const __kiwotiGo = WebAssembly.instantiateStreaming(
  fetch("kiwotigo.wasm"),
  go.importObject
).then((result) => {
  go.run(result.instance);
});

export const DefaultConfig = {
  gridWidth: 10,
  gridHeight: 10,
  gridOuterPaddingX: 25,
  gridOuterPaddingY: 25,
  gridInnerPaddingX: 6,
  gridInnerPaddingY: 3,
  gridHexWidth: 16,
  gridHexHeight: 14,
  hexWidth: 12, //24,
  hexHeight: 12,
  hexPaddingX: 0, //5,  //3,
  hexPaddingY: 0, //5,  //3,
  fastGrowIterations: 8, //10,
  minimalGrowIterations: 120, //48,
  maxRegionSizeFactor: 3,
  divisibilityBy: 1,
  probabilityCreateRegionAt: 0.6,
};

export function createContinent(cfg) {
  return __kiwotiGo.then(
    () =>
      new Promise((resolve) => {
        __kiwotiGo_createContinent(
          {
            ...DefaultConfig,
            ...cfg,
          },
          (result) => resolve(JSON.parse(result))
        );
      })
  );
}
