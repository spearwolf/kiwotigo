const REGION_OUTLINE_STROKE = '#c5c5c5';
const REGION_BASE_PATH_FILL = '#e7e7e7';
const REGION_FULL_PATH_FILL = '#f5f5f5';
const REGION_RADIUS_STROKE = '#a1a1a1';
const REGION_OUTER_RADIUS_STROKE = '#bababa';
const CONNECTION_STROKE = "#f5b";

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

  drawPath(ctx, continent.regions, "fullPath", true);

  if (drawBasePath) {
    ctx.fillStyle = REGION_BASE_PATH_FILL;

    drawPath(ctx, continent.regions, "basePath");
  }
}

function drawRegionsBase(ctx, continent) {
  // ctx.fillStyle = "rgba(255, 255, 128, 0.75)";
  ctx.lineWidth = 1;

  continent.centerPoints.forEach((cp) => {
    ctx.strokeStyle = REGION_RADIUS_STROKE;
    ctx.beginPath();
    ctx.arc(cp.x, cp.y, cp.iR, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = REGION_OUTER_RADIUS_STROKE;
    ctx.beginPath();
    ctx.arc(cp.x, cp.y, cp.oR, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.stroke();
  });
}

function drawRegionsConnections(ctx, continent) {
  ctx.strokeStyle = CONNECTION_STROKE;
  ctx.lineWidth = 2;

  const { neighbors, centerPoints } = continent;

  for (let i = 0; i < neighbors.length; i++) {
    const p0 = centerPoints[i];
    for (let j = 0; j < neighbors[i].length; j++) {
      const p1 = centerPoints[neighbors[i][j]];
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.closePath();
      ctx.stroke();
    }
  }
}

function drawRegionIds(ctx, continent) {
  ctx.font = "bold 36px sans-serif";
  ctx.shadowColor = "#fff";
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 4;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#666";

  const { centerPoints } = continent;

  for (let i = 0; i < centerPoints.length; i++) {
    ctx.fillText(`${i}`, centerPoints[i].x, centerPoints[i].y);
  }
}

export default function draw(ctx, continent) {
  clearCanvas(ctx);
  drawRegions(ctx, continent, true);
  drawRegionsBase(ctx, continent);
  drawRegionsConnections(ctx, continent);
  drawRegionIds(ctx, continent);
}