import { createContinent } from './kiwotigo-wasm-bridge.mjs';
import { findAndConnectAllIslands } from './kiwotigo-unite-islands.mjs';

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
  enableExtendedConnections: true,
  maxExtendedOuterRangeFactor: 4.0,
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

  regions.forEach(({ centerPoint: cP, fullPath }) => {
    top = min(top, cP.y - cP.oR);
    bottom = max(bottom, cP.y + cP.oR);
    left = min(left, cP.x - cP.oR);
    right = max(right, cP.x + cP.oR);

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

const calcRegionBoundingBox = ({ centerPoint: cP, fullPath }) => {
  let top = cP.y;
  let bottom = cP.y;
  let left = cP.x;
  let right = cP.x;

  const len = fullPath.length >> 1;
  for (let i = 0; i < len; i++) {
    const x = fullPath[i << 1];
    const y = fullPath[(i << 1) + 1];
    top = min(top, y);
    bottom = max(bottom, y);
    left = min(left, x);
    right = max(right, x);
  }

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

// ============= path smoothing ============================================

const getCoordId = (x, y) => `${y};${x}`;

class PathCoordLocation {
  constructor(regionId, pathType, pathIndex) {
    this.regionId = regionId;
    this.pathType = pathType;
    this.pathIndex = pathIndex;
  }
}

class PathCoord {
  constructor(id) {
    this.id = id;
    this.locations = [];
    this.coords = null;
  }

  addLocation(pathLocation) {
    this.locations.push(pathLocation);
  }

  getCoordsIndices(regions, pLoc, coordsOffset = 0) {
    const p = regions[pLoc.regionId][pLoc.pathType];
    const pLen = p.length;
    let xIndex = (pLoc.pathIndex + coordsOffset * 2) % pLen;
    if (xIndex < 0) {
      xIndex += pLen;
    }
    let yIndex = (pLoc.pathIndex + (coordsOffset * 2 + 1)) % p.length;
    if (yIndex < 0) {
      yIndex += pLen;
    }
    return [xIndex, yIndex];
  }

  getCoords(regions, pLoc, coordsOffset = 0) {
    const p = regions[pLoc.regionId][pLoc.pathType];
    const [xIndex, yIndex] = this.getCoordsIndices(regions, pLoc, coordsOffset);
    return [p[xIndex], p[yIndex]];
  }

  copyCoords(regions, pLoc) {
    const [xIndex, yIndex] = this.getCoordsIndices(regions, pLoc, 0);
    const p = regions[pLoc.regionId][pLoc.pathType];
    p[xIndex] = this.coords[0];
    p[yIndex] = this.coords[1];
  }

  calcSmoothCoords(regions, weights) {
    const values = [];
    this.locations.forEach((pLoc) => {
      weights.forEach(([offset, weight]) => {
        const [x, y] = this.getCoords(regions, pLoc, offset);
        values.push([x, y, weight]);
      });
    });
    const xSum = values.reduce((sum, [val, , w]) => val * w + sum, 0);
    const ySum = values.reduce((sum, [, val, w]) => val * w + sum, 0);
    const wSum = values.reduce((sum, [, , w]) => w + sum, 0);
    this.coords = [xSum / wSum, ySum / wSum];
  }

  writeCoordsToLocations(regions) {
    this.locations.forEach((pLoc) => {
      this.copyCoords(regions, pLoc);
    });
  }
}

const collectPathCoords = (regionId, pathType, path, coords) => {
  const len = path.length;
  for (let i = 0; i < len; i += 2) {
    const coordId = getCoordId(path[i], path[i + 1]);
    let pathCoord = coords.get(coordId);
    if (!pathCoord) {
      pathCoord = new PathCoord(coordId);
      coords.set(coordId, pathCoord);
    }
    pathCoord.addLocation(new PathCoordLocation(regionId, pathType, i));
  }
};

const smoothAllPaths = (regions) => {
  const coords = new Map();

  // 1. collect all full~basePath coordinates
  regions.forEach(({ id, fullPath, basePath }) => {
    collectPathCoords(id, 'fullPath', fullPath, coords);
    collectPathCoords(id, 'basePath', basePath, coords);
  });

  // 2. smooth all coordinates
  for (const pathCoord of coords.values()) {
    pathCoord.calcSmoothCoords(regions, [
      // [-3, 0.25],
      // [-2, 0.5],
      // [-1, 0.75],
      // [0, 1.5],
      // [1, 0.75],
      // [2, 0.5],
      // [3, 0.25],
      //---------------
      // [-2, 0.25],
      // [-1, 0.5],
      // [0, 1.5],
      // [1, 0.5],
      // [2, 0.25],
      //---------------
      [-1, 0.5],
      [0, 1],
      [1, 0.4],
      [3, 0.2],
    ]);
  }

  // 3. write coords back
  for (const pathCoord of coords.values()) {
    pathCoord.writeCoordsToLocations(regions);
  }
};

// -------------------------------------------------------------------------

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

  smoothAllPaths(regions);

  const bBox = getBoundingBox(regions);
  const offsetX = bBox.left - config.canvasMargin;
  const offsetY = bBox.top - config.canvasMargin;

  transformAllCoords(regions, (x, y) => [x - offsetX, y - offsetY]);

  const canvasWidth = bBox.width + 2 * config.canvasMargin;
  const canvasHeight = bBox.height + 2 * config.canvasMargin;

  regions.forEach((region) => {
    region.bBox = calcRegionBoundingBox(region);
  });

  return {
    regions,
    canvasWidth,
    canvasHeight,
  };
};

// =========================================================================

const _postProgress = (id) => (progress) =>
  postMessage({ id, progress, type: 'progress' });

self.onmessage = (e) => {
  const { id, originData, ...data } = e.data;
  const postProgress = _postProgress(id);

  let config;
  let afterCreateContinent;

  if (originData) {
    const parsedOriginData =
      typeof originData === 'string' ? JSON.parse(originData) : originData;
    config = { ...DefaultConfig, ...parsedOriginData.config, ...data };
    afterCreateContinent = Promise.resolve(parsedOriginData);
  } else {
    config = { ...DefaultConfig, ...data };
    afterCreateContinent = createContinent(config, (progress) =>
      postProgress(progress * 0.7)
    );
  }

  afterCreateContinent
    .then((result) => {
      postProgress(0.7);

      const originData = JSON.stringify({
        config,
        continent: result.continent,
      });

      let continent;
      try {
        // TODO path smoothing !!
        //      see https://pctipps.de/gewichteter-durchschnitt/

        continent = convertToIntermediateContinentalFormat(
          config,
          result.continent
        );

        postProgress(0.8);

        continent = findAndConnectAllIslands(continent, config);
      } catch (err) {
        console.error('kiwotigo post-processing panic!', err);
      }

      return {
        id,
        config,
        continent,
        originData,
      };
    })
    .then((result) => postMessage({ ...result, type: 'result' }));
};
