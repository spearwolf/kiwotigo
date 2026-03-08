const DARK_THEME = window.matchMedia('(prefers-color-scheme: dark)').matches;

const REGION_OUTLINE_STROKE = DARK_THEME ? '#2f2f2f' : '#a5a5a5';
const REGION_BASE_PATH_FILL = DARK_THEME ? '#888' : '#e7e7e7';
const REGION_FULL_PATH_FILL = DARK_THEME ? '#666' : '#f5f5f5';
const REGION_RADIUS_STROKE = DARK_THEME ? 'rgb(200 200 200 / 75%)' : '#a9a9a9';
const REGION_BBOX_STROKE = DARK_THEME ? '#333' : '#f0f0f0';
const REGION_OUTER_RADIUS_STROKE = DARK_THEME ? '#444' : '#cacaca';
const CONNECTION_STROKE = DARK_THEME ? '#c04' : '#f5b';
const CONNECTION_TO_OTHER_ISLAND_STROKE = DARK_THEME ? 'rgb(204 0 68 / 75%)' : 'rgb(255 85 187 / 75%)';
const REGION_ID_TEXT_FILL = DARK_THEME ? '#ccc' : '#666';
const REGION_ID_SHADOW = DARK_THEME ? '#4b4b4b' : '#fff';

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

  ctx.setLineDash([]);
}

const getRegion = (continent, regionIdx) => continent.regions[regionIdx];

function drawRegionsConnections(ctx, continent, { drawRegionConnections, drawAirConnections }) {
  const alreadyDrawn = new Set();

  const drawLine = (a, b, air) => {
    const id = a.id < b.id ? `${a.id};${b.id}` : `${b.id};${a.id}`;
    if (alreadyDrawn.has(id)) return;
    alreadyDrawn.add(id);
    if (air) {
      ctx.strokeStyle = CONNECTION_TO_OTHER_ISLAND_STROKE;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);
    } else {
      ctx.strokeStyle = CONNECTION_STROKE;
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
    }
    ctx.beginPath();
    ctx.moveTo(a.centerPoint.x, a.centerPoint.y);
    ctx.lineTo(b.centerPoint.x, b.centerPoint.y);
    ctx.closePath();
    ctx.stroke();
  };

  continent.regions.forEach((region) => {
    if (drawRegionConnections) {
      region.neighbors.forEach((nId) =>
        drawLine(region, getRegion(continent, nId), false)
      );
    }
    if (drawAirConnections) {
      region.airNeighbors.forEach((nId) =>
        drawLine(region, getRegion(continent, nId), true)
      );
    }
  });

  ctx.setLineDash([]);
}

function drawRegionIds(ctx, continent) {
  ctx.font = 'bold 36px sans-serif';
  ctx.shadowColor = REGION_ID_SHADOW;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 4;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = REGION_ID_TEXT_FILL;

  continent.regions.forEach(({ centerPoint: { x, y } }, i) => {
    ctx.fillText(`${i}`, x, y);
  });

  ctx.shadowBlur = 0;
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
  if (cfg.drawRegionConnections || cfg.drawAirConnections) {
    drawRegionsConnections(ctx, icf, cfg);
  }
  if (cfg.drawRegionIds) {
    drawRegionIds(ctx, icf);
  }
}
