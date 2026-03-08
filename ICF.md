# Intermediate Continental Format (ICF)

The Intermediate Continental Format is the data structure produced by kiwotigo's `build()` function. It describes a procedurally generated 2D world map as a graph of polygonal regions.

```js
import { build } from "kiwotigo";

const { continent } = await build(config, onProgress);
// continent : KiwotigoContinent
```

## Data Overview

| Concept | Description |
|---------|-------------|
| **Regions** | Polygonal areas with geometry, topology, and metadata |
| **Islands** | Connected components in the region graph |
| **Paths** | Flat-encoded polygon outlines (`basePath` = inner core, `fullPath` = outer boundary) |
| **Center Points & Radii** | Center coordinate + inner/outer radius per region |
| **Neighbor Graph** | Adjacency list with land connections and air connections (mutually exclusive sets) |
| **Bounding Boxes** | Axis-aligned bounding rectangles per region + canvas dimensions |

## Schema

### Top-level result

```ts
interface IntermediateContinentalFormat {
  id: string;                    // build correlation id
  config: KiwotigoConfig;        // effective config used for this build
  continent: KiwotigoContinent;  // the map data (see below)
  originData?: string;           // raw generation data for re-processing
}
```

### Continent

```ts
interface KiwotigoContinent {
  regions: KiwotigoRegion[];  // all regions on the map
  canvasWidth: number;        // total width including margins
  canvasHeight: number;       // total height including margins
  islands: number[][];        // region ids grouped by connected component
}
```

### Region

```ts
interface KiwotigoRegion {
  id: number;              // unique region index (0-based, contiguous)

  // --- Geometry ---
  basePath: number[];      // inner core outline, flat [x, y, x, y, ...]
  fullPath: number[];      // outer region boundary, flat [x, y, x, y, ...]
  centerPoint: {
    x: number;             // center x
    y: number;             // center y
    iR: number;            // inner radius
    oR: number;            // outer radius
  };
  bBox: {
    top: number;
    left: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  };

  // --- Topology ---
  neighbors: number[];     // region ids sharing a physical hex-grid border (from Go output; land only)
  airNeighbors: number[];  // region ids connected via cross-island bridge or line-of-sight (exclusive)
  islandId: number;        // index into continent.islands

  // --- Metrics ---
  size: number;            // relative size (1.0 = average)
}
```

## Geometry

### Flat path encoding

Paths store polygon vertices as flat interleaved coordinate arrays:

```
Vertices: (10, 20), (30, 40), (50, 60)
Encoding: [10, 20, 30, 40, 50, 60]
```

To iterate vertices:

```js
for (let i = 0; i < region.fullPath.length; i += 2) {
  const x = region.fullPath[i];
  const y = region.fullPath[i + 1];
}
```

To render as an SVG polygon:

```js
const points = [];
for (let i = 0; i < region.fullPath.length; i += 2) {
  points.push(`${region.fullPath[i]},${region.fullPath[i + 1]}`);
}
const svg = `<polygon points="${points.join(" ")}" />`;
```

### basePath vs fullPath

- **`basePath`** — the inner core outline of a region (smaller polygon).
- **`fullPath`** — the outer boundary of a region (larger polygon, defines the actual territory).

Both are smoothed and margin-shifted. Coordinates are render-ready — no additional transformation is needed.

### Center point and radii

- `centerPoint.x`, `centerPoint.y` — geometric center of the region.
- `centerPoint.iR` — inner radius (distance to the nearest edge of the core).
- `centerPoint.oR` — outer radius (distance to the farthest edge of the boundary).

## Topology

### Neighbor graph

`region.neighbors` contains the ids of all regions connected to this region. The graph is always **symmetric**: if `A` is in `B.neighbors`, then `B` is in `A.neighbors`.

There are two kinds of neighbor connections, stored in **mutually exclusive** arrays:

1. **`neighbors`** — regions that share a hex-grid boundary (from the Go generation step). Never modified by JS post-processing.
2. **`airNeighbors`** — connections added during post-processing: cross-island bridges and line-of-sight links. Never overlap with `neighbors`.

The sets are disjoint: `neighbors ∩ airNeighbors = ∅` per region.

To traverse the full connectivity graph (land + air), union both arrays:

```js
const allConnected = [...region.neighbors, ...region.airNeighbors];
```

### airNeighbors

`airNeighbors` is **mutually exclusive with `neighbors`**. It contains every connection that was added by the island-connection and line-of-sight algorithms — these are connections that don't correspond to a shared hex-grid boundary and are never present in `neighbors`.

Symmetry holds for air neighbors too: if `A` is in `B.airNeighbors`, then `B` is in `A.airNeighbors`.

### Islands

`continent.islands` groups region ids by connected component. Each entry is an array of region ids that form one contiguous landmass. A region's `islandId` is its index into `continent.islands`.

After post-processing, all islands are connected into a single graph via air neighbors. The island structure is preserved to let consumers distinguish between "same landmass" and "connected by bridge/line-of-sight".

### Line-of-sight connections

Some air neighbors are line-of-sight connections: two regions are connected if a straight line from center A to center B does not pass through any other region. These can be intra-island or cross-island. They appear only in `airNeighbors`, never in `neighbors`.

## Invariants

Consumers can rely on:

- `fullPath` and `basePath` are flat `[x, y, ...]` arrays with **even length**
- `region.id` values are unique and contiguous (0 to `regions.length - 1`)
- All ids in `neighbors` and `airNeighbors` are valid region ids
- `neighbors` and `airNeighbors` are disjoint: `neighbors ∩ airNeighbors = ∅` per region
- Neighbor symmetry: `A ∈ B.neighbors ⟺ B ∈ A.neighbors` (same for `airNeighbors`)
- `islandId` is a valid index into `continent.islands`
- Coordinates are margin-shifted and ready for direct rendering
- `bBox` is consistent with the region's path coordinates

Recommended validations for downstream tooling:

- Even path lengths
- Neighbor ids in range `[0, regions.length)`
- Neighbor symmetry (especially after mutations)
- Region ids unique and contiguous
