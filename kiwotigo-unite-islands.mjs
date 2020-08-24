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
  islands = islands.map((regionsIds) => Array.from(new Set(regionsIds)));

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

const calcRegionDistances = (regionFrom, regionsTo) => {
  const { x, y } = regionFrom.centerPoint;
  return regionsTo.map(({ centerPoint }) =>
    Math.sqrt(Math.pow(centerPoint.x - x, 2) + Math.pow(centerPoint.y - y, 2))
  );
};

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

function connectIslands(continent) {
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
      };
    });

    const minIndex = findMinIndex(
      distancesToOtherIslands.map(({ distance }) => distance)
    );

    const nearest = distancesToOtherIslands[minIndex];

    continent.regions[nearest.regionFrom].neighbors.push(nearest.regionTo);
    continent.regions[nearest.regionTo].neighbors.push(nearest.regionFrom);

    curIsland.push(...otherIslands[nearest.otherIslandsIndex]);
    otherIslands.splice(nearest.otherIslandsIndex, 1);
    islands = [curIsland, ...otherIslands];
  }

  return continent;
}

export const findAndConnectAllIslands = (continent) =>
  connectIslands(findIslands(continent));
