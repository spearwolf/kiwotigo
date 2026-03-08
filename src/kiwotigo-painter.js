const DARK_THEME = window.matchMedia('(prefers-color-scheme: dark)').matches;

function getColors(dark) {
  return {
    regionOutlineStroke:           dark ? '#2f2f2f' : '#a5a5a5',
    regionBasePathFill:            dark ? '#888'    : '#e7e7e7',
    regionFullPathFill:            dark ? '#666'    : '#f5f5f5',
    regionRadiusStroke:            dark ? 'rgb(200 200 200 / 75%)' : '#a9a9a9',
    regionBBoxStroke:              dark ? '#333'    : '#f0f0f0',
    regionOuterRadiusStroke:       dark ? '#444'    : '#cacaca',
    connectionStroke:              dark ? '#c04'    : '#f5b',
    connectionToOtherIslandStroke: dark ? 'rgb(204 104 0 / 75%)' : 'rgb(255 154 0 / 75%)',
    regionIdTextFill:              dark ? '#ccc'    : '#666',
    regionIdShadow:                dark ? '#4b4b4b' : '#fff',
  };
}

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

function drawRegions(ctx, continent, drawBasePath, colors) {
  ctx.strokeStyle = colors.regionOutlineStroke;
  ctx.lineWidth = 1;

  ctx.fillStyle = colors.regionFullPathFill;
  drawPath(ctx, continent.regions, 'fullPath', true);

  if (drawBasePath) {
    ctx.fillStyle = colors.regionBasePathFill;
    drawPath(ctx, continent.regions, 'basePath');
  }
}

function drawRegionsBase(ctx, continent, colors) {
  ctx.lineWidth = 1;

  continent.regions.forEach(({ centerPoint: cp }) => {
    ctx.strokeStyle = colors.regionRadiusStroke;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(cp.x, cp.y, cp.iR, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = colors.regionOuterRadiusStroke;
    ctx.setLineDash([5, 15, 25]);
    ctx.beginPath();
    ctx.arc(cp.x, cp.y, cp.oR, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.stroke();
  });

  ctx.setLineDash([]);
}

const getRegion = (continent, regionIdx) => continent.regions[regionIdx];

function drawRegionsConnections(ctx, continent, { drawRegionConnections, drawAirConnections }, colors) {
  const alreadyDrawn = new Set();

  const drawLine = (a, b, air) => {
    const id = a.id < b.id ? `${a.id};${b.id}` : `${b.id};${a.id}`;
    if (alreadyDrawn.has(id)) return;
    alreadyDrawn.add(id);
    if (air) {
      ctx.strokeStyle = colors.connectionToOtherIslandStroke;
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 8]);
    } else {
      ctx.strokeStyle = colors.connectionStroke;
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
      region.neighbors.forEach((nId) => {
        drawLine(region, getRegion(continent, nId), false)
      });
    }
    if (drawAirConnections) {
      region.airNeighbors.forEach((nId) => {
        drawLine(region, getRegion(continent, nId), true)
      });
    }
  });

  ctx.setLineDash([]);
}

function drawRegionIds(ctx, continent, colors) {
  ctx.font = 'bold 36px sans-serif';
  ctx.shadowColor = colors.regionIdShadow;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 4;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = colors.regionIdTextFill;

  continent.regions.forEach(({ centerPoint: { x, y } }, i) => {
    ctx.fillText(`${i}`, x, y);
  });

  ctx.shadowBlur = 0;
}

function drawBoundingBoxes(ctx, { regions }, colors) {
  ctx.strokeStyle = colors.regionBBoxStroke;
  regions.forEach(({ bBox }) => {
    ctx.beginPath();
    ctx.rect(bBox.left, bBox.top, bBox.width, bBox.height);
    ctx.stroke();
  });
}

export default function draw({ ctx, icf, ...cfg }) {
  const dark = cfg.darkMode ?? DARK_THEME;
  const colors = getColors(dark);
  clearCanvas(ctx);
  if (cfg.drawRegionBoundingBoxes) {
    drawBoundingBoxes(ctx, icf, colors);
  }
  drawRegions(ctx, icf, cfg.drawRegionBasePaths, colors);
  if (cfg.drawRegionsBase) {
    drawRegionsBase(ctx, icf, colors);
  }
  if (cfg.drawRegionConnections || cfg.drawAirConnections) {
    drawRegionsConnections(ctx, icf, cfg, colors);
  }
  if (cfg.drawRegionIds) {
    drawRegionIds(ctx, icf, colors);
  }
}
