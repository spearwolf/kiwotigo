import { createContinent } from './kiwotigo-wasm-bridge.mjs';

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
  // misc
  pointsRasterizer: {
    cols: 500,
    rows: 500,
  },
  transformPoints: {
    scaleX: 1.2,
    scaleY: 1.3,
    rotateDegree: 45,
  },
  disablePointsRasterizer: true,
  disableTransformPoints: false,
};

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  scale(scaleX, scaleY) {
    this.x = this.x * scaleX;
    this.y = this.y * scaleY;
    return this;
  }

  rotate(cx, cy, angle) {
    const radians = (Math.PI / 180) * angle;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const x = cos * (this.x - cx) + sin * (this.y - cy) + cx;
    const y = cos * (this.y - cy) - sin * (this.x - cx) + cy;
    this.x = x;
    this.y = y;
    return this;
  }

  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }

  toArray() {
    return [this.x, this.y];
  }
}

export default class TransformPoints {
  constructor(kiwotigo) {
    this.kiwotigo = kiwotigo;
    this.minX = 0;
    this.minY = 0;
    this.maxX = 0;
    this.maxY = 0;
  }

  get config() {
    return this.kiwotigo.config.transformPoints;
  }

  get width() {
    return this.kiwotigo.canvasWidth;
  }
  get height() {
    return this.kiwotigo.canvasWidth;
  }

  get centerPointX() {
    return this.width / 2.0;
  }
  get centerPointY() {
    return this.height / 2.0;
  }

  get scaleX() {
    return this.config.scaleX || 1.0;
  }
  get scaleY() {
    return this.config.scaleY || 1.0;
  }

  get rotateDegree() {
    return this.config.rotateDegree || 1.0;
  }

  transformPoint(
    centerPointX,
    centerPointY,
    rotateDegree,
    scaleX,
    scaleY,
    point,
  ) {
    const np = new Point(point.x, point.y)
      .rotate(centerPointX, centerPointY, rotateDegree)
      .scale(scaleX, scaleY)
      .round();
    if (np.x < this.minX) this.minX = np.x;
    if (np.x > this.maxX) this.maxX = np.x;
    if (np.y < this.minY) this.minY = np.y;
    if (np.y > this.maxY) this.maxY = np.y;
    return np;
  }

  convertPoints(points) {
    const transformPoint = this.transformPoint.bind(
      this,
      this.centerPointX,
      this.centerPointY,
      this.rotateDegree,
      this.scaleX,
      this.scaleY,
    );
    return points.map(transformPoint);
  }

  convertCenterPoints(points) {
    const transformPoint = this.transformPoint.bind(
      this,
      this.centerPointX,
      this.centerPointY,
      this.rotateDegree,
      this.scaleX,
      this.scaleY,
    );
    return points.map((cp) => {
      const ncp = transformPoint(cp);
      return {
        x: ncp.x,
        y: ncp.y,
        iR: cp.iR,
        oR: cp.oR,
      };
    });
  }
}

const uniq = (val, idx, self) => self.indexOf(val) === idx; // TODO optimize

function createPoints(kiwotigo) {
  kiwotigo.points = new Array(kiwotigo.cols * kiwotigo.rows);

  const { fx, fy } = kiwotigo;

  for (let y = 0; y < kiwotigo.rows; y += 1) {
    for (let x = 0; x < kiwotigo.cols; x += 1) {
      kiwotigo.points[y * kiwotigo.cols + x] = new Point(
        Math.round(x * fx + fx * Math.random()),
        Math.round(y * fy + fy * Math.random()),
      );
    }
  }
}

class PointsRasterizer {
  constructor(kiwotigo) {
    this.kiwotigo = kiwotigo;
    createPoints(this);
  }

  get config() {
    return this.kiwotigo.config.pointsRasterizer;
  }

  get cols() {
    return this.config.cols;
  }
  get rows() {
    return this.config.rows;
  }

  get fx() {
    return this.kiwotigo.canvasWidth / this.cols;
  }
  get fy() {
    return this.kiwotigo.canvasHeight / this.rows;
  }

  pointAt(x, y) {
    const col = Math.floor(x / this.fx);
    const row = Math.floor(y / this.fy);
    return this.points[row * this.cols + col];
  }

  convertPoints(points) {
    return points.map((p) => this.pointAt(p.x, p.y)).filter(uniq);
  }
}

export class Kiwotigo {
  constructor(config, result) {
    this.config = config;
    this.kiwotigoJson = result;
    this.viewBox = [0, 0, this.canvasWidth, this.canvasHeight];
    if (!config.disableTransformPoints) {
      this.transformPoints();
    }
    if (!config.disablePointsRasterizer) {
      this.rasterizePoints();
    }
  }

  get worldWidth() {
    return this.viewBox[2] - this.viewBox[0];
  }

  get worldHeight() {
    return this.viewBox[3] - this.viewBox[1];
  }

  rasterizePoints() {
    if (this.config.disablePointsRasterizer === true) return;
    const rasterizer = new PointsRasterizer(this);
    this.regions.forEach((region) => {
      region.basePath = rasterizer.convertPoints(region.basePath);
      region.fullPath = rasterizer.convertPoints(region.fullPath);
    });
  }

  transformPoints() {
    if (this.config.disableTransform === true) return;
    const transform = new TransformPoints(this);
    this.regions.forEach((region) => {
      region.basePath = transform.convertPoints(region.basePath);
      region.fullPath = transform.convertPoints(region.fullPath);
    });
    this.centerPoints = transform.convertCenterPoints(this.centerPoints);
    this.viewBox = [
      transform.minX,
      transform.minY,
      transform.maxX,
      transform.maxY,
    ];
  }

  build() {
    return {
      config: this.kiwotigoJson.config,
      canvas: {
        width: this.worldWidth,
        height: this.worldHeight,
        viewBox: this.viewBox,
      },
      continent: {
        ...this.kiwotigoJson.continent,
        regions: this.kiwotigoJson.continent.regions.map(
          ({ basePath, fullPath }) => ({
            basePath: basePath.flatMap((vec) => [vec.x, vec.y]),
            fullPath: fullPath.flatMap((vec) => [vec.x, vec.y]),
          }),
        ),
      },
    };
  }

  // neighbors: [
  //      [<index>, <index>, ..],
  //      ..
  //   ]
  //
  get neighbors() {
    return this.world.neighbors;
  }

  // centerPoints: [{
  //       x, y,
  //       iR,      <-- inner radius
  //       oR       <-- outer radius
  //   }, ..]
  //
  get centerPoints() {
    return this.world.centerPoints;
  }

  set centerPoints(centerPoints) {
    this.world.centerPoints = centerPoints;
  }

  get regionSizes() {
    return this.world.regionSizes;
  }

  // regions: [{
  //      basePath: [{x,y}, ..],
  //      fullPath: [{x,y}, ..],
  //   }, ..]
  //
  get regions() {
    return this.world.regions;
  }

  get canvasWidth() {
    return this.world.width;
  }

  get canvasHeight() {
    return this.world.height;
  }

  get world() {
    return this.kiwotigoJson.continent;
  }

  get worldConfig() {
    return this.kiwotigoJson.config;
  }
}

// =========================================================================

console.log('hej kiwotigo 🦄');

self.onmessage = (e) => {
  const { id, ...data } = e.data;
  const config = { ...DefaultConfig, ...data };

  // TODO post progress events
  createContinent(config)
    .then((result) => ({ id, ...new Kiwotigo(config, result).build() }))
    .then(postMessage);
};
