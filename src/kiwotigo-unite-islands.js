const uniq = (arr) => Array.from(new Set(arr));

function findIslands(continent) {
  const visitedRegions = new Set();

  const crawlIsland = (regionId) => {
    visitedRegions.add(regionId);
    const { neighbors } = continent.regions[regionId];
    return [
      regionId,
      ...neighbors
        .filter((neighborId) => !visitedRegions.has(neighborId))
        .map((neighborId) => crawlIsland(neighborId))
        .flat(),
    ];
  };

  let islands = [];

  continent.regions.forEach((region) => {
    if (!visitedRegions.has(region.id)) {
      islands.push(crawlIsland(region.id));
    }
  });

  // remove duplicates
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
      islandId,
      airNeighbors: [],
    };
  });

  return {
    ...continent,
    islands,
    regions,
  };
}

function densifyFlatPath(flatPath, minDist = 10) {
  const result = [];
  const n = flatPath.length;
  for (let i = 0; i < n; i += 2) {
    const x0 = flatPath[i], y0 = flatPath[i + 1];
    const ni = (i + 2) % n;
    const x1 = flatPath[ni], y1 = flatPath[ni + 1];
    result.push(x0, y0);
    const dx = x1 - x0, dy = y1 - y0;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > minDist) {
      const steps = Math.ceil(dist / minDist);
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
    if ((yi > py) !== (yj > py) &&
        px < (xj - xi) * (py - yi) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  if (inside) return true;
  // proximity check: distance <= 1.0 to any vertex
  for (let i = 0; i < n; i += 2) {
    const dx = densePath[i] - px, dy = densePath[i + 1] - py;
    if (dx * dx + dy * dy <= 1.0) return true;
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

const calcDistance = (from, to) =>
  Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));

const calcRegionDistances = ({ centerPoint: from }, regions) =>
  regions.map(({ centerPoint: to }) => calcDistance(from, to));

const findMinIndex = (arr) => {
  let min = arr[0];
  let minIndex = 0;

  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < min) {
      min = arr[i];
      minIndex = i;
    }
  }

  return minIndex;
};

const findRegionsWithinOuterRange = ({
  continent,
  exlcudeIslands,
  includeIslands,
  exlcudeRegions,
  from,
  range,
  maxRange,
}) =>
  continent.regions
    .filter(
      (region) =>
        !exlcudeRegions.includes(region.id) &&
        !exlcudeIslands.includes(region.islandId) &&
        (!includeIslands || includeIslands.includes(region.islandId))
    )
    .filter(({ centerPoint: to }) => {
      const distance = calcDistance(from, to);
      return distance <= maxRange && distance - to.oR <= range;
    })
    .map((region) => region.id);

function makeNewConnections(regions, connections) {
  connections.forEach(([from, to]) => {
    regions[from].airNeighbors.push(to);
    regions[to].airNeighbors.push(from);
  });
  regions.forEach((region) => {
    region.airNeighbors = uniq(region.airNeighbors);
  });
}

function connectIslands(continent, config) {
  const cfg = {
    enableExtendedConnections: true,
    maxExtendedOuterRangeFactor: 4.0,
    ...config,
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
            otherIslandsIndex,
          };
        }
      );
      const minIndex = findMinIndex(
        islandDistances.map(({ distance }) => distance)
      );
      return {
        regionFrom: regionId,
        regionTo: islandDistances[minIndex].regionId,
        distance: islandDistances[minIndex].distance,
        otherIslandsIndex: islandDistances[minIndex].otherIslandsIndex,
        islandDistances,
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
          maxRange:
            continent.regions[nearest.regionFrom].centerPoint.oR *
            cfg.maxExtendedOuterRangeFactor,
        }).map((id) => [nearest.regionFrom, id]),
        ...findRegionsWithinOuterRange({
          continent,
          exlcudeRegions: [nearest.regionFrom, nearest.regionTo],
          exlcudeIslands: [continent.regions[nearest.regionTo].islandId],
          // includeIslands: [continent.regions[nearest.regionFrom].islandId],
          from: continent.regions[nearest.regionTo].centerPoint,
          range: nearest.distance,
          maxRange:
            continent.regions[nearest.regionTo].centerPoint.oR *
            cfg.maxExtendedOuterRangeFactor,
        }).map((id) => [nearest.regionTo, id]),
      ];

      connections.push(...extendedConnections);
      makeNewConnections(continent.regions, connections);

      // TODO find sharp triangular relationships to filter out triangles which are too flat

    } else {
      makeNewConnections(continent.regions, connections);
    }

    curIsland.push(...otherIslands[nearest.otherIslandsIndex]);
    otherIslands.splice(nearest.otherIslandsIndex, 1);
    islands = [curIsland, ...otherIslands];
  }

  return continent;
}

function connectByLineOfSight(continent, config) {
  const lineOfSightDensity = config?.lineOfSightDensity ?? 10;
  const { regions } = continent;
  const densePathCache = regions.map((r) => densifyFlatPath(r.fullPath, lineOfSightDensity));
  const connections = [];

  for (const regionA of regions) {
    const neighborsSet = new Set([...regionA.neighbors, ...regionA.airNeighbors]);
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

      for (let s = lineOfSightDensity; s < dist; s += lineOfSightDensity) {
        const px = ax + stepX * s;
        const py = ay + stepY * s;
        const hit = findRegionAtPoint(px, py, regions, densePathCache);
        if (hit === -1 || hit === regionA.id) continue;
        if (hit === regionB.id) {
          connected = true;
          break;
        }
        // hit another region, abort
        break;
      }

      if (connected) {
        connections.push([regionA.id, regionB.id]);
        // add to set so we don't test B→A again
        neighborsSet.add(regionB.id);
      }
    }
  }

  if (connections.length > 0) {
    makeNewConnections(regions, connections);
  }
}

export const findAndConnectAllIslands = (continent, config) => {
  const connected = connectIslands(findIslands(continent), config);
  if (config?.enableLineOfSightConnections !== false) {
    connectByLineOfSight(connected, config);
  }
  return connected;
};
