# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**kiwotigo** is a procedural world map generator. It produces randomly generated 2D maps of hexagonal *regions* that are connected like a graph. The core algorithm is written in Go and exposed in two ways:

1. A **CLI tool** (`kiwotigo-tool/`) that prints JSON to stdout
2. A **WebAssembly module** (`kiwotigo-js-bridge/`) used by a JavaScript demo UI (`src/`)

## Commands

**Prerequisites:** Node.js v22.13+, pnpm v10.9+, Go 1.24+

```sh
# Build the WASM module and copy wasm_exec.js into src/
pnpm build

# Start a local HTTP dev server (serves the demo UI with the built WASM)
pnpm dev

# Run all Go tests
go test ./...

# Run a single Go test by name
go test -run TestHexagonGridNeighbors

# Build the CLI tool (outputs ./kiwotigo binary)
pnpm build:tool

# Build the WASM module directly (outputs ./kiwotigo.wasm)
pnpm build:wasm

# Run the CLI tool
./kiwotigo -gridWidth=10 -gridHeight=10 -prettyPrint=true
```

The docker-compose config (`docker-compose.yml`) serves the built output via Caddy on port 5432.

## Generated Files

The following files are produced by the build process. **Never edit these files directly** — they will be overwritten on the next build. Always edit the source files instead.

Run `pnpm build` to build all of them in one go (runs all sub-tasks in parallel via `concurrently`).

| Generated file | Produced by | Source |
|----------------|-------------|--------|
| `kiwotigo` (binary) | `pnpm build:tool` | `kiwotigo-tool/main.go` |
| `kiwotigo.wasm` | `pnpm build:wasm` | `kiwotigo-js-bridge/main.go` (GOOS=js GOARCH=wasm) |
| `src/wasm_exec.js` | `pnpm build:wasm` | Copied from `$(go env GOROOT)/lib/wasm/wasm_exec.js` (Go stdlib) |
| `kiwotigo.js` (root) | esbuild via `build:kiwotigo` | `src/kiwotigo.js` |
| `kiwotigo.worker.js` (root) | esbuild via `build:worker` | `src/kiwotigo.worker.js` |
| `kiwotigo-demo.js` (root) | esbuild via `build:demo` | `src/kiwotigo-demo.js` |

Note: `kiwotigo.d.ts` at the root is a hand-written TypeScript declaration file — it is **not** generated.

## Architecture

The primary entry point is the Go library. A `ContinentConfig` is passed to `ContinentCreationStrategy`, which produces a `ContinentDescription` as JSON. This raw output is then post-processed by the JavaScript layer into the *Intermediate Continental Format* (ICF), which is the actual data format consumed by any downstream application.

### Go library (package `kiwotigo`) — the core

The root package is the reusable Go library. The generation pipeline in `ContinentCreationStrategy.BuildContinent()` works as follows:

1. **HexagonGrid** (`hexagon_grid.go`) — Creates a flat 2D grid of `Hexagon` structs, each with pointers to its 6 directional neighbors (North, NE, SE, South, SW, NW) and 2 horizontal neighbors (Left/Right). Odd columns are offset vertically to form the hex grid layout.

2. **RegionGridMask** (`region_grid_mask.go`) — Probabilistically decides which grid cells get a seed region (controlled by `ProbabilityCreateRegionAt` and `DivisibilityBy`).

3. **Region** (`region.go`) — A set of `Hexagon`s that belong together. Regions track their neighboring regions. `AssignHexagon` panics if a hexagon already belongs to another region. Key methods: `RegionLessNeighborHexagons()` (candidate hexagons to grow into), `ShapeHexagons()` (edge hexagons only), `SingleRandomShapeHexagon()` (leftmost edge hexagon).

4. **Growth algorithm** (`continent_creation_strategy.go`) — Seeds regions at random positions, then iterates: fast-grow (claim all unclaimed neighbors), standard grow (weighted random), close holes (claim hexagons with 5+ region neighbors), and finally merges disconnected groups by growing boundary regions until the whole map is one connected component (`RegionGroup`).

5. **Continent** (`continent.go`) — The output struct. After growth, `CreateShapes()` traces the boundary path of each region (two passes: `"basePath"` early, `"fullPath"` at end), `MakeNeighbors()` builds adjacency lists, `UpdateCenterPoints()` computes inner/outer radii, `UpdateRegionSizes()` normalizes sizes relative to the average.

6. **ContinentDescription** (`continent_description.go`) — Wraps `Continent` + `ContinentConfig` and serializes to JSON. This is the raw Go output.

### Raw Go JSON output

Paths are arrays of `{x, y}` objects. Region arrays and centerPoints/neighbors/regionSizes are parallel arrays indexed by region id.

```json
{
  "continent": {
    "width": ..., "height": ...,
    "regions": [{ "basePath": [{x,y},...], "fullPath": [{x,y},...] }],
    "centerPoints": [{ "x":..., "y":..., "innerRadius":..., "outerRadius":... }],
    "regionSizes": [...],
    "neighbors": [[1,2,...], ...]
  },
  "config": { ... }
}
```

### WebAssembly bridge (`kiwotigo-js-bridge/main.go`)

Exposes `__kiwotiGo_createContinent` as a global JS function. It receives a config object and two callbacks (progress, ready), runs `BuildContinent`, and invokes the ready callback with the JSON string result.

### CLI tool (`kiwotigo-tool/main.go`)

Accepts all `ContinentConfig` fields as flags. Calls `BuildContinent` and prints the result JSON to stdout. Useful for quick inspection or piping into other tools.

### JavaScript layer (`src/`) — post-processing pipeline

The JavaScript layer is the **intended production environment**. It runs entirely in a Web Worker and transforms the raw Go output into the ICF through several stages:

**Stage 1 — WASM call** (`kiwotigo-wasm-bridge.js`)
Loads and instantiates `kiwotigo.wasm` (lazy, singleton). Merges caller config with `DefaultConfig` and calls `__kiwotiGo_createContinent`. Parses the returned JSON string into an object.

**Stage 2 — ICF conversion** (`kiwotigo.worker.js` → `convertToIntermediateContinentalFormat`)
Transforms the raw Go output into per-region objects, flattens `{x,y}` path arrays into interleaved flat `[x, y, x, y, ...]` arrays, and assembles the ICF region structure:
```js
{ id, basePath: [x,y,...], fullPath: [x,y,...], centerPoint: {x, y, iR, oR}, neighbors: [...], size }
```
Note: `centerPoint` uses shorthand field names (`iR`=innerRadius, `oR`=outerRadius).

**Stage 3 — Path smoothing** (`kiwotigo.worker.js` → `smoothAllPaths`)
Runs a weighted-average smoothing pass **twice** over all path vertices. Each vertex is categorized by its context:
- `seaside` — appears in only one region's `fullPath` (outer coastline vertex)
- `inland` — shared by multiple regions' `fullPath` (boundary between two regions)
- `city` — appears in a `basePath` (inner core of a region)

Each category uses different smoothing weights (spread of neighboring vertices, different for coast vs. interior). Shared vertices between adjacent regions are smoothed consistently because they reference the same coordinate by identity (`getCoordId` key). The smoothed coordinates are written back into all path arrays in-place.

**Stage 4 — Coordinate normalization** (`kiwotigo.worker.js`)
Computes the bounding box of all region paths and center points, then translates all coordinates so the content starts at `(canvasMargin, canvasMargin)`. Also computes `canvasWidth`/`canvasHeight` and per-region `bBox`.

**Stage 5 — Island detection & connection** (`kiwotigo-unite-islands.js`)
`findIslands()` does a DFS over the neighbor graph to find connected components and assigns an `islandId` to each region. `connectIslands()` then greedily connects disconnected islands by finding the nearest region pair across islands and adding a neighbor connection. With `enableExtendedConnections: true` (default), additional connections are created to all regions within `maxExtendedOuterRangeFactor * outerRadius` of either endpoint. Repeats until all regions are in one connected component.

### Intermediate Continental Format (ICF) — the target data format

This is the output of `build()` and the format consumed by rendering and downstream applications:

```js
{
  regions: [{
    id: 0,
    basePath: [x, y, x, y, ...],   // inner core outline, flat interleaved
    fullPath: [x, y, x, y, ...],   // outer region outline, flat interleaved
    centerPoint: { x, y, iR, oR }, // center, inner radius, outer radius
    neighbors: [1, 2, ...],        // region ids (includes cross-island connections)
    size: 1.2,                     // relative size (1.0 = average)
    islandId: 0,                   // connected component id
    bBox: { top, bottom, left, right, width, height }
  }],
  canvasWidth: ...,
  canvasHeight: ...,
  islands: [[0,1,2], [3,4], ...]   // region ids grouped by connected component
}
```

### Public JS API (`kiwotigo.js`)

- `configure({kiwotigoWasmUrl, kiwotigoWorkerUrl, broadcastChannelName})` — must be called before `build()` if non-default URLs are needed.
- `build(config, onProgressFn)` — returns a Promise resolving to `{id, config, continent: ICF, originData}`. `onProgressFn` receives values 0–1.
- `startBroadcasting()` — opens a `BroadcastChannel` so multiple tabs share build results automatically.

**originData re-use:** The worker serializes the raw Go output as `originData` (a JSON string stored in `localStorage` by the demo). If a subsequent `build()` call includes `originData` in the config, the WASM step is **skipped entirely** — only stages 2–5 re-run. This allows re-applying JS post-processing (e.g. different smoothing or island connection parameters) to the same base continent without re-running the expensive Go generation.

### Renderer (`kiwotigo-painter.js`)

Canvas 2D renderer for the ICF. Draws: `fullPath` fills, `basePath` fills (optional), inner/outer radius circles (optional), neighbor connection lines (dashed for cross-island connections), region id labels, and per-region bounding boxes. Supports dark/light theme.

## Key constraints

- A `Hexagon` can only be assigned to **one** `Region`; `AssignHexagon` panics on reassignment.
- `BuildContinent` should only be called **once** per `ContinentCreationStrategy` instance.
- Hexagon neighbor indices (used in `RegionShape`): 0=NE, 1=N, 2=NW, 3=SW, 4=S, 5=SE. The shape edge traversal order is `{3, 2, 1, 0, 5, 4}`.
- Path smoothing writes coordinates back in-place. The flat interleaved format (`[x, y, x, y, ...]`) is only present after ICF conversion — the raw Go output uses `[{x,y}, ...]` objects.
- `neighbors` in the ICF can contain cross-island connections added by `kiwotigo-unite-islands.js` that do not exist in the raw Go output.
