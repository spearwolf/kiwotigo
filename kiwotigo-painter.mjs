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
  //ctx.strokeStyle = '#000000';
  //ctx.fillStyle = '#d0f0ff';
  ctx.strokeStyle = "#333333"; //'#246';
  ctx.fillStyle = "#9BCB3C"; // '#88C425';
  ctx.lineWidth = 1;

  drawPath(ctx, continent.regions, "fullPath", true);

  if (drawBasePath) {
    //ctx.fillStyle = '#c0e0ee';
    ctx.fillStyle = "#61A548"; //'#BEF202';

    drawPath(ctx, continent.regions, "basePath");
  }
}

function drawRegionsBase(ctx, continent) {
  ctx.fillStyle = "rgba(239, 246, 105, 0.5)";
  ctx.lineWidth = 1;

  continent.centerPoints.forEach((cp) => {
    ctx.beginPath();
    ctx.arc(cp.x, cp.y, cp.iR, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cp.x, cp.y, cp.oR, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.stroke();
  });
}

function drawRegionsConnections(ctx, continent) {
  ctx.strokeStyle = "#CF3333"; // "rgba(255, 0, 128, 0.5)";
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
  ctx.font = "normal 24px Verdana";
  ctx.shadowColor = "#000";
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  ctx.shadowBlur = 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fffff0";

  const { centerPoints } = continent;

  for (let i = 0; i < centerPoints.length; i++) {
    ctx.fillText(`${i}`, centerPoints[i].x, centerPoints[i].y);
  }
}

export default function draw(ctx, continent) {
  clearCanvas(ctx);
  drawRegions(ctx, continent, false);
  drawRegionsBase(ctx, continent);
  drawRegionsConnections(ctx, continent);
  drawRegionIds(ctx, continent);
}
