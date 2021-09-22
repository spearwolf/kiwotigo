const REGION_OUTLINE_STROKE = '#a5a5a5';
const REGION_BASE_PATH_FILL = '#e7e7e7';
const REGION_FULL_PATH_FILL = '#f5f5f5';
const REGION_RADIUS_STROKE = '#a9a9a9';
const REGION_BBOX_STROKE = '#f0f0f0';
const REGION_OUTER_RADIUS_STROKE = '#cacaca';
const CONNECTION_STROKE = '#f5b';

function clearCanvas(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function drawPath(ctx, regions, pathName, stroke = false) {
  regions.forEach((region) => {
    const path = region[pathName];

    ctx.beginPath();
    ctx.moveTo(path[0], path[1]);
    const len = path.length >> 1;
    for (let i = 1; i < len; i++) {
      ctx.lineTo(path[i << 1], path[(i << 1) + 1]);
    }
    ctx.closePath();

    ctx.fill();
    if (stroke) {
      ctx.stroke();
    }
  });
}

function drawRegions(ctx, continent, drawBasePath) {
  ctx.strokeStyle = REGION_OUTLINE_STROKE;
  ctx.lineWidth = 1;

  ctx.fillStyle = REGION_FULL_PATH_FILL;
  drawPath(ctx, continent.regions, 'fullPath', true);

  if (drawBasePath) {
    ctx.fillStyle = REGION_BASE_PATH_FILL;
    drawPath(ctx, continent.regions, 'basePath');
  }
}

function drawRegionsBase(ctx, continent) {
  ctx.lineWidth = 1;

  continent.regions.forEach(({ centerPoint: cp }) => {
    ctx.strokeStyle = REGION_RADIUS_STROKE;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(cp.x, cp.y, cp.iR, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = REGION_OUTER_RADIUS_STROKE;
    ctx.setLineDash([5, 15, 25]);
    ctx.beginPath();
    ctx.arc(cp.x, cp.y, cp.oR, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.stroke();
  });
}

const getRegion = (continent, regionIdx) => continent.regions[regionIdx];

function drawRegionsConnections(ctx, continent) {
  ctx.setLineDash([]);
  ctx.strokeStyle = CONNECTION_STROKE;
  ctx.lineWidth = 3;

  const alreadyDrawnConnection = new Set();

  continent.regions.forEach((region) => {
    region.neighbors.forEach((neighborId) => {
      const connectionId =
        region.id < neighborId
          ? `${region.id};${neighborId}`
          : `${neighborId};${region.id}`;
      if (!alreadyDrawnConnection.has(connectionId)) {
        alreadyDrawnConnection.add(connectionId);
        const otherRegion = getRegion(continent, neighborId);
        const isAnotherIsland = region.islandId !== otherRegion.islandId;

        ctx.setLineDash(isAnotherIsland ? [3, 6] : []);
        ctx.beginPath();
        ctx.moveTo(region.centerPoint.x, region.centerPoint.y);
        ctx.lineTo(otherRegion.centerPoint.x, otherRegion.centerPoint.y);
        ctx.closePath();
        ctx.stroke();
      }
    });
  });

  ctx.setLineDash([]);
}

function drawRegionIds(ctx, continent) {
  ctx.font = 'bold 36px sans-serif';
  ctx.shadowColor = '#fff';
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 4;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#666';

  continent.regions.forEach(({ centerPoint: { x, y } }, i) => {
    ctx.fillText(`${i}`, x, y);
  });
}

function drawBoundingBoxes(ctx, { regions }) {
  ctx.strokeStyle = REGION_BBOX_STROKE;
  regions.forEach(({ bBox }) => {
    ctx.beginPath();
    ctx.rect(bBox.left, bBox.top, bBox.width, bBox.height);
    ctx.stroke();
  });
}

export default function draw({ ctx, icf, ...cfg }) {
  clearCanvas(ctx);
  if (cfg.drawRegionBoundingBoxes) {
    drawBoundingBoxes(ctx, icf);
  }
  drawRegions(ctx, icf, cfg.drawRegionBasePaths);
  if (cfg.drawRegionsBase) {
    drawRegionsBase(ctx, icf);
  }
  if (cfg.drawRegionConnections) {
    drawRegionsConnections(ctx, icf);
  }
  if (cfg.drawRegionIds) {
    drawRegionIds(ctx, icf);
  }
}
