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
    };
  });

  return {
    ...continent,
    islands,
    regions,
  };
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

export const findAndConnectAllIslands = (continent, config) =>
  connectIslands(findIslands(continent), config);
