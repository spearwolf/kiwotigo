export declare function configure(options: {broadcastChannelName?: string; kiwotigoWorkerUrl?: string}): void;

export declare function startBroadcasting(): void;

export type ProgressCallback = (progress: number) => void;

export interface KiwotigoConfig {
  canvasMargin: number;
  enableExtendedConnections: boolean;
  fastGrowIterations: number;
  gridHeight: number;
  gridHexHeight: number;
  gridHexWidth: number;
  gridInnerPaddingX: number;
  gridInnerPaddingY: number;
  gridOuterPaddingX: number;
  gridOuterPaddingY: number;
  gridWidth: number;
  hexHeight: number;
  hexPaddingX: number;
  hexPaddingY: number;
  hexWidth: number;
  maxExtendedOuterRangeFactor: number;
  maxRegionSizeFactor: number;
  minimalGrowIterations: number;
  probabilityCreateRegionAt: number;
}

export interface KiwotigoRegion {
  bBox: {top: number; left: number; right: number; bottom: number; width: number; height: number};
  basePath: number[];
  centerPoint: {x: number; y: number; iR: number; oR: number};
  fullPath: number[];
  id: number;
  islandId: number;
  neighbours: number[];
  size: number;
}

export interface KiwotigoContinent {
  canvasWidth: number;
  canvasHeight: number;
  islands: number[][];
  regions: KiwotigoRegion[];
}

export interface IntermediateContinentalFormat {
  config: KiwotigoConfig;
  continent: KiwotigoContinent;
  id: string;
  originData?: string;
}

export declare function build(
  config: Partial<KiwotigoConfig>,
  onProgress?: ProgressCallback,
): Promise<IntermediateContinentalFormat>;
