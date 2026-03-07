(() => {
  // src/kiwotigo-wasm-bridge.js
  var kiwotigoWasmUrl = "kiwotigo.wasm";
  var __kiwotiGo;
  function init(wasmUrl) {
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
  var DefaultConfig = {
    gridWidth: 5,
    //10,
    gridHeight: 5,
    //10,
    gridOuterPaddingX: 80,
    //25,
    gridOuterPaddingY: 80,
    //25,
    gridInnerPaddingX: 15,
    //6,
    gridInnerPaddingY: 15,
    //3,
    gridHexWidth: 15,
    //16,
    gridHexHeight: 15,
    //14,
    hexWidth: 10,
    //12, //24,
    hexHeight: 10,
    //12,
    hexPaddingX: 0,
    //5,  //3,
    hexPaddingY: 0,
    //5,  //3,
    fastGrowIterations: 5,
    //8, //10,
    minimalGrowIterations: 20,
    //120, //48,
    maxRegionSizeFactor: 3,
    probabilityCreateRegionAt: 0.5,
    //0.6,
    divisibilityBy: 1
  };
  function createContinent(cfg, onProgress) {
    return init().then(() => {
      onProgress(0.1);
      return new Promise((resolve) => {
        __kiwotiGo_createContinent(
          {
            ...DefaultConfig,
            ...cfg
          },
          (progress) => {
            onProgress(0.1 + progress * 0.7);
          },
          (result) => {
            onProgress(0.8);
            const json = JSON.parse(result);
            onProgress(0.9);
            resolve(json);
          }
        );
      });
    });
  }

  // src/kiwotigo-unite-islands.js
  var uniq = (arr) => Array.from(new Set(arr));
  function findIslands(continent) {
    const visitedRegions = /* @__PURE__ */ new Set();
    const crawlIsland = (regionId) => {
      visitedRegions.add(regionId);
      const { neighbors } = continent.regions[regionId];
      return [
        regionId,
        ...neighbors.filter((neighborId) => !visitedRegions.has(neighborId)).map((neighborId) => crawlIsland(neighborId)).flat()
      ];
    };
    let islands = [];
    continent.regions.forEach((region) => {
      if (!visitedRegions.has(region.id)) {
        islands.push(crawlIsland(region.id));
      }
    });
    islands = islands.map(uniq);
    const regions = continent.regions.map((region) => {
      let islandId;
      for (let i = 0; i < islands.length; i++) {
        if (islands[i].includes(region.id)) {
          islandId = i;
          break;
        }
      }
      return {
        ...region,
        islandId
      };
    });
    return {
      ...continent,
      islands,
      regions
    };
  }
  function densifyFlatPath(flatPath) {
    const result = [];
    const n = flatPath.length;
    for (let i = 0; i < n; i += 2) {
      const x0 = flatPath[i], y0 = flatPath[i + 1];
      const ni = (i + 2) % n;
      const x1 = flatPath[ni], y1 = flatPath[ni + 1];
      result.push(x0, y0);
      const dx = x1 - x0, dy = y1 - y0;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1) {
        const steps = Math.ceil(dist);
        for (let s = 1; s < steps; s++) {
          const t = s / steps;
          result.push(x0 + dx * t, y0 + dy * t);
        }
      }
    }
    return result;
  }
  function pointInPolygon(px, py, densePath) {
    let inside = false;
    const n = densePath.length;
    for (let i = 0, j = n - 2; i < n; j = i, i += 2) {
      const xi = densePath[i], yi = densePath[i + 1];
      const xj = densePath[j], yj = densePath[j + 1];
      if (yi > py !== yj > py && px < (xj - xi) * (py - yi) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    if (inside) return true;
    for (let i = 0; i < n; i += 2) {
      const dx = densePath[i] - px, dy = densePath[i + 1] - py;
      if (dx * dx + dy * dy <= 1) return true;
    }
    return false;
  }
  function findRegionAtPoint(x, y, regions, densePathCache) {
    for (let i = 0; i < regions.length; i++) {
      if (pointInPolygon(x, y, densePathCache[i])) {
        return regions[i].id;
      }
    }
    return -1;
  }
  var calcDistance = (from, to) => Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
  var calcRegionDistances = ({ centerPoint: from }, regions) => regions.map(({ centerPoint: to }) => calcDistance(from, to));
  var findMinIndex = (arr) => {
    let min2 = arr[0];
    let minIndex = 0;
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] < min2) {
        min2 = arr[i];
        minIndex = i;
      }
    }
    return minIndex;
  };
  var findRegionsWithinOuterRange = ({
    continent,
    exlcudeIslands,
    includeIslands,
    exlcudeRegions,
    from,
    range,
    maxRange
  }) => continent.regions.filter(
    (region) => !exlcudeRegions.includes(region.id) && !exlcudeIslands.includes(region.islandId) && (!includeIslands || includeIslands.includes(region.islandId))
  ).filter(({ centerPoint: to }) => {
    const distance = calcDistance(from, to);
    return distance <= maxRange && distance - to.oR <= range;
  }).map((region) => region.id);
  function makeNewConnections(regions, connections) {
    connections.forEach(([from, to]) => {
      regions[from].neighbors.push(to);
      regions[to].neighbors.push(from);
    });
    regions.forEach((region) => {
      region.neighbors = uniq(region.neighbors);
    });
  }
  function connectIslands(continent, config) {
    const cfg = {
      enableExtendedConnections: true,
      maxExtendedOuterRangeFactor: 4,
      ...config
    };
    let islands = [...continent.islands];
    while (islands.length > 1) {
      const [curIsland, ...otherIslands] = islands;
      const distancesToOtherIslands = curIsland.map((regionId) => {
        const region = continent.regions[regionId];
        const islandDistances = otherIslands.map(
          (otherIsland, otherIslandsIndex) => {
            const otherRegions = otherIsland.map((rId) => continent.regions[rId]);
            const distancesToOtherRegions = calcRegionDistances(
              region,
              otherRegions
            );
            const idx = findMinIndex(distancesToOtherRegions);
            return {
              regionId: otherRegions[idx].id,
              distance: distancesToOtherRegions[idx],
              otherIslandsIndex
            };
          }
        );
        const minIndex2 = findMinIndex(
          islandDistances.map(({ distance }) => distance)
        );
        return {
          regionFrom: regionId,
          regionTo: islandDistances[minIndex2].regionId,
          distance: islandDistances[minIndex2].distance,
          otherIslandsIndex: islandDistances[minIndex2].otherIslandsIndex,
          islandDistances
        };
      });
      const minIndex = findMinIndex(
        distancesToOtherIslands.map(({ distance }) => distance)
      );
      const nearest = distancesToOtherIslands[minIndex];
      const connections = [[nearest.regionFrom, nearest.regionTo]];
      if (cfg.enableExtendedConnections) {
        const extendedConnections = [
          ...findRegionsWithinOuterRange({
            continent,
            exlcudeRegions: [nearest.regionFrom, nearest.regionTo],
            exlcudeIslands: [continent.regions[nearest.regionFrom].islandId],
            from: continent.regions[nearest.regionFrom].centerPoint,
            range: nearest.distance,
            maxRange: continent.regions[nearest.regionFrom].centerPoint.oR * cfg.maxExtendedOuterRangeFactor
          }).map((id) => [nearest.regionFrom, id]),
          ...findRegionsWithinOuterRange({
            continent,
            exlcudeRegions: [nearest.regionFrom, nearest.regionTo],
            exlcudeIslands: [continent.regions[nearest.regionTo].islandId],
            // includeIslands: [continent.regions[nearest.regionFrom].islandId],
            from: continent.regions[nearest.regionTo].centerPoint,
            range: nearest.distance,
            maxRange: continent.regions[nearest.regionTo].centerPoint.oR * cfg.maxExtendedOuterRangeFactor
          }).map((id) => [nearest.regionTo, id])
        ];
        connections.push(...extendedConnections);
        makeNewConnections(continent.regions, connections);
      } else {
        makeNewConnections(continent.regions, connections);
      }
      curIsland.push(...otherIslands[nearest.otherIslandsIndex]);
      otherIslands.splice(nearest.otherIslandsIndex, 1);
      islands = [curIsland, ...otherIslands];
    }
    return continent;
  }
  function connectByLineOfSight(continent) {
    const { regions } = continent;
    const densePathCache = regions.map((r) => densifyFlatPath(r.fullPath));
    const connections = [];
    for (const regionA of regions) {
      const neighborsSet = new Set(regionA.neighbors);
      neighborsSet.add(regionA.id);
      for (const regionB of regions) {
        if (neighborsSet.has(regionB.id)) continue;
        const ax = regionA.centerPoint.x;
        const ay = regionA.centerPoint.y;
        const dx = regionB.centerPoint.x - ax;
        const dy = regionB.centerPoint.y - ay;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) continue;
        const stepX = dx / dist;
        const stepY = dy / dist;
        let connected = false;
        for (let s = 1; s < dist; s++) {
          const px = ax + stepX * s;
          const py = ay + stepY * s;
          const hit = findRegionAtPoint(px, py, regions, densePathCache);
          if (hit === -1 || hit === regionA.id) continue;
          if (hit === regionB.id) {
            connected = true;
            break;
          }
          break;
        }
        if (connected) {
          connections.push([regionA.id, regionB.id]);
          neighborsSet.add(regionB.id);
        }
      }
    }
    if (connections.length > 0) {
      makeNewConnections(regions, connections);
    }
  }
  var findAndConnectAllIslands = (continent, config) => {
    const connected = connectIslands(findIslands(continent), config);
    if (config?.enableLineOfSightConnections !== false) {
      connectByLineOfSight(connected);
    }
    return connected;
  };

  // src/kiwotigo.core.js
  var DefaultConfig2 = {
    gridWidth: 7,
    gridHeight: 7,
    gridOuterPaddingX: 80,
    gridOuterPaddingY: 80,
    gridInnerPaddingX: 15,
    gridInnerPaddingY: 15,
    gridHexWidth: 15,
    gridHexHeight: 15,
    hexWidth: 10,
    hexHeight: 10,
    hexPaddingX: 0,
    hexPaddingY: 0,
    minimalGrowIterations: 20,
    fastGrowIterations: 5,
    maxRegionSizeFactor: 3,
    probabilityCreateRegionAt: 0.5,
    divisibilityBy: 1,
    enableExtendedConnections: true,
    maxExtendedOuterRangeFactor: 4,
    canvasMargin: 100
  };
  var min = (a, b) => a < b ? a : b;
  var max = (a, b) => a > b ? a : b;
  var getBoundingBox = (regions) => {
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
      height: bottom - top
    };
  };
  var calcRegionBoundingBox = ({ centerPoint: cP, fullPath }) => {
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
      height: bottom - top
    };
  };
  var transformAllCoords = (regions, transformer) => {
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
  var getCoordId = (x, y) => `${Math.round(y)};${Math.round(x)}`;
  var PathCoordLocation = class {
    constructor(regionId, pathType, pathIndex) {
      this.regionId = regionId;
      this.pathType = pathType;
      this.pathIndex = pathIndex;
    }
  };
  var PathCoord = class {
    constructor(id, isBaseline) {
      this.id = id;
      this.locations = [];
      this.coords = null;
      this.isBaseline = isBaseline;
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
    getCoastType() {
      if (this.isBaseline) {
        return "city";
      }
      return this.locations.length === 1 ? "seaside" : "inland";
    }
    calcSmoothCoords(regions, weights, coastTypesFilter) {
      const values = [];
      const coastType = this.getCoastType();
      if (coastTypesFilter && !coastTypesFilter.includes(coastType)) {
        return;
      }
      this.locations.forEach((pLoc) => {
        weights[coastType].forEach(([offset, weight]) => {
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
  };
  var collectPathCoords = (regionId, pathType, path, coords) => {
    const len = path.length;
    for (let i = 0; i < len; i += 2) {
      const coordId = getCoordId(path[i], path[i + 1]);
      let pathCoord = coords.get(coordId);
      if (!pathCoord) {
        pathCoord = new PathCoord(coordId, pathType === "basePath");
        coords.set(coordId, pathCoord);
      }
      pathCoord.addLocation(new PathCoordLocation(regionId, pathType, i));
    }
  };
  var smoothAllPaths = (regions) => {
    const coords = /* @__PURE__ */ new Map();
    regions.forEach(({ id, fullPath, basePath }) => {
      collectPathCoords(id, "fullPath", fullPath, coords);
      collectPathCoords(id, "basePath", basePath, coords);
    });
    const weights = {
      city: [
        [-5, 0.071],
        [-4, 0.362],
        [-3, 0.621],
        [-2, 0.825],
        [-1, 0.955],
        [0, 1],
        [1, 0.955],
        [2, 0.825],
        [3, 0.621],
        [4, 0.362],
        [5, 0.071]
      ],
      inland: [
        [-1, 0.5],
        [1, 1],
        [2, 0.5]
      ],
      seaside: [
        [-2, 0.2],
        [-1, 0.4],
        [1, 1],
        [2, 0.4],
        [-2, 0.2]
      ]
    };
    for (const pathCoord of coords.values()) {
      pathCoord.calcSmoothCoords(regions, weights);
    }
    for (const pathCoord of coords.values()) {
      pathCoord.writeCoordsToLocations(regions);
    }
    for (const pathCoord of coords.values()) {
      pathCoord.calcSmoothCoords(regions, weights);
    }
    for (const pathCoord of coords.values()) {
      pathCoord.writeCoordsToLocations(regions);
    }
  };
  var flattenPathCoords = (path) => path.flatMap((vec) => [vec.x, vec.y]);
  var convertToIntermediateContinentalFormat = (config, continent) => {
    const regions = continent.regions.map((region, id) => ({
      id,
      basePath: flattenPathCoords(region.basePath),
      fullPath: flattenPathCoords(region.fullPath),
      centerPoint: continent.centerPoints[id],
      neighbors: continent.neighbors[id],
      size: continent.regionSizes[id]
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
      canvasHeight
    };
  };
  var buildContinent = async (data, originDataInput, onProgress) => {
    let config;
    let result;
    if (originDataInput) {
      const parsedOriginData = typeof originDataInput === "string" ? JSON.parse(originDataInput) : originDataInput;
      config = { ...DefaultConfig2, ...parsedOriginData.config, ...data };
      result = parsedOriginData;
    } else {
      config = { ...DefaultConfig2, ...data };
      result = await createContinent(config, (progress) => onProgress(progress * 0.7));
    }
    onProgress(0.7);
    const originData = JSON.stringify({
      config,
      continent: result.continent
    });
    let continent = convertToIntermediateContinentalFormat(config, result.continent);
    onProgress(0.8);
    continent = findAndConnectAllIslands(continent, config);
    return {
      config,
      continent,
      originData
    };
  };

  // src/kiwotigo.worker.js
  var _postProgress = (id) => (progress) => postMessage({ id, progress, type: "progress" });
  self.onmessage = async (e) => {
    if (e.data?.kiwotigoWasmUrl) {
      init(e.data.kiwotigoWasmUrl);
      return;
    }
    const { id, originData, ...data } = e.data;
    const postProgress = _postProgress(id);
    try {
      const result = await buildContinent(data, originData, postProgress);
      postMessage({ ...result, id, type: "result" });
    } catch (err) {
      console.error("kiwotigo post-processing panic!", err);
      postMessage({
        id,
        type: "error",
        message: err.message || String(err),
        stack: err.stack
      });
    }
  };
})();
