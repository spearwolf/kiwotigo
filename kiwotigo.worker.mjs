import { createContinent } from "./kiwotigo-wasm-bridge.mjs";
import { findAndConnectAllIslands } from "./kiwotigo-unite-islands.mjs";

const DefaultConfig = {
  // kiwotigo/continent
  gridWidth: 7,
  gridHeight: 7,
  gridOuterPaddingX: 40,
  gridOuterPaddingY: 40,
  gridInnerPaddingX: 8,
  gridInnerPaddingY: 8,
  gridHexWidth: 15,
  gridHexHeight: 15,
  hexWidth: 10,
  hexHeight: 10,
  hexPaddingX: 0,
  hexPaddingY: 0,
  minimalGrowIterations: 100,
  fastGrowIterations: 4,
  maxRegionSizeFactor: 3,
  probabilityCreateRegionAt: 0.7,
  // NEW:
  canvasMargin: 10,
};

// =========================================================================

const min = (a, b) => (a < b ? a : b);
const max = (a, b) => (a > b ? a : b);

const getBoundingBox = (regions) => {
  const anyCenterPoint = regions[0].centerPoint;
  let top = anyCenterPoint.y;
  let bottom = anyCenterPoint.y;
  let left = anyCenterPoint.x;
  let right = anyCenterPoint.x;

  regions.forEach(({ centerPoint: { x, y, oR }, fullPath }) => {
    top = min(top, y - oR);
    bottom = max(bottom, y + oR);
    left = min(left, x - oR);
    right = max(right, x + oR);

    const len = fullPath.length >> 1;
    for (let i = 0; i < len; i++) {
      const x = fullPath[i << 1];
      const y = fullPath[(i << 1) + 1];
      top = min(top, y);
      bottom = max(bottom, y);
      left = min(left, x);
      right = max(right, x);
    }
  });

  return {
    top,
    bottom,
    left,
    right,
    width: right - left,
    height: bottom - top,
  };
};

const transformAllCoords = (regions, transformer) => {
  const transformPath = (path) => {
    const len = path.length >> 1;
    for (let i = 0; i < len; i++) {
      const xi = i << 1;
      path.splice(xi, 2, ...transformer(path[xi], path[xi + 1]));
    }
  };

  regions.forEach(({ centerPoint, fullPath, basePath }) => {
    const v = transformer(centerPoint.x, centerPoint.y);
    centerPoint.x = v[0];
    centerPoint.y = v[1];

    transformPath(fullPath);
    transformPath(basePath);
  });
};

const flattenPathCoords = (path) => path.flatMap((vec) => [vec.x, vec.y]);

const convertToIntermediateContinentalFormat = (config, continent) => {
  const regions = continent.regions.map((region, id) => ({
    id,
    basePath: flattenPathCoords(region.basePath),
    fullPath: flattenPathCoords(region.fullPath),
    centerPoint: continent.centerPoints[id],
    neighbors: continent.neighbors[id],
    size: continent.regionSizes[id],
  }));

  const bBox = getBoundingBox(regions);
  const offsetX = bBox.left - config.canvasMargin;
  const offsetY = bBox.top - config.canvasMargin;

  transformAllCoords(regions, (x, y) => [x - offsetX, y - offsetY]);

  const canvasWidth = bBox.width + 2 * config.canvasMargin;
  const canvasHeight = bBox.height + 2 * config.canvasMargin;

  return {
    regions,
    canvasWidth,
    canvasHeight,
  };
};

// =========================================================================

console.log("hej kiwotigo 🦄");

const _postProgress = (id) => (progress) =>
  postMessage({ id, progress, type: "progress" });

self.onmessage = (e) => {
  const { id, ...data } = e.data;
  const config = { ...DefaultConfig, ...data };
  const postProgress = _postProgress(id);

  createContinent(config, (progress) => postProgress(progress * 0.7))
    .then((result) => {
      postProgress(0.7);

      let continent;
      try {
        continent = convertToIntermediateContinentalFormat(
          config,
          result.continent
        );

        postProgress(0.8);

        continent = findAndConnectAllIslands(continent);
      } catch (err) {
        console.error("kiwotigo post-processing panic!", err);
      }

      return {
        id,
        config,
        continent,
      };
    })
    .then((result) => postMessage({ ...result, type: "result" }));
};
