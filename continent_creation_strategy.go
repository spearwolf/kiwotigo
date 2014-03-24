package kiwotigo

import (
	"math/rand"
	"time"
)

type ContinentCreationStrategy struct {
	RegionGrid
	ContinentConfig
	rand                      *rand.Rand
	Continent                 *Continent
	probabilityCreateRegionAt float64
}

func NewContinentCreationStrategy(cfg ContinentConfig) (ccs *ContinentCreationStrategy) {
	ccs = new(ContinentCreationStrategy)
	ccs.ContinentConfig = cfg
	ccs.RegionGrid = *NewRegionGrid(cfg.GridWidth, cfg.GridHeight)
	ccs.rand = rand.New(rand.NewSource(time.Now().UnixNano()))
	ccs.Continent = NewContinent(cfg.GridWidth*cfg.GridHexWidth, cfg.GridHeight*cfg.GridHexHeight, cfg.HexWidth, cfg.HexHeight, cfg.HexPaddingX, cfg.HexPaddingY)
	ccs.Continent.regions = make([]*Region, 0, cfg.GridWidth*cfg.GridHeight)
	ccs.probabilityCreateRegionAt = 0.5
	return
}

func (ccs *ContinentCreationStrategy) shouldCreateRegionAt(x, y uint) bool {
	if ccs.hasRegion(x, y) {
		return false
	}
	return ccs.rand.Float64() < ccs.probabilityCreateRegionAt
}

type gridRegionFn func(x, y uint, region *Region)

func (ccs *ContinentCreationStrategy) ForEachGridRegion(fn gridRegionFn) {
	var x, y uint
	gridWidth, gridHeight := ccs.Width(), ccs.Height()
	for y = 0; y < gridHeight; y++ {
		for x = 0; x < gridWidth; x++ {
			fn(x, y, ccs.Region(x, y))
		}
	}
}

func (ccs *ContinentCreationStrategy) fillGridWithRegions() {
	ccs.ForEachGridRegion(func(x, y uint, _ *Region) {
		if ccs.shouldCreateRegionAt(x, y) {
			ccs.initializeRegionAt(x, y)
		}
	})
}

func (ccs *ContinentCreationStrategy) CreateRegions() {
	ccs.fillGridWithRegions()
}

//     __    __    __    __    __
//    /  \__/  \__/  \__/  \__/  \__
//    \__/  \__/  \__/  \__/  \__/  \
//    /  \__/  \__/  \__/  \__/  \__/
//    \__/  \__/  \__/  \__/  \__/  \
//    /  \__/  \__/  \__/  \__/  \__/
//    \__/  \__/  \__/  \__/  \__/  \
//    /  \__/  \__/n \__/  \__/  \__/
//    \__/  \__/nw\__/ne\__/  \__/  \
//    /  \__/nw\__/n \__/ne\__/  \__/
//    \__/  \__/nw\_x/ne\__/  \__/  \
//    /  \__/sw\_x/x \_x/se\__/  \__/
//    \__/  \__/sw\__/se\__/  \__/  \
//    /  \__/sw\_x/s \_x/se\__/  \__/
//    \__/  \__/sw\_x/se\__/  \__/  \
//    /  \__/  \__/s \__/  \__/  \__/
//    \__/  \__/  \__/  \__/  \__/  \
//    /  \__/  \__/  \__/  \__/  \__/
//    \__/  \__/  \__/  \__/  \__/  \
//    /  \__/  \__/  \__/  \__/  \__/
//    \__/  \__/  \__/  \__/  \__/  \
//       \__/  \__/  \__/  \__/  \__/
//
func (ccs *ContinentCreationStrategy) initializeRegionAt(gridX, gridY uint) {
	var x, y uint
	x = ccs.GridHexWidth*gridX + uint(ccs.rand.Intn(int(ccs.GridHexWidth)-4)+2)
	y = ccs.GridHexHeight*gridY + uint(ccs.rand.Intn(int(ccs.GridHexWidth)-4)+2)

	region := new(Region)
	hexagon := ccs.Continent.model.Hexagon(x, y)

	region.AssignHexagon(hexagon)
	region.AssignHexagon(hexagon.NeighborNorthWest)
	region.AssignHexagon(hexagon.NeighborNorth)
	region.AssignHexagon(hexagon.NeighborNorthEast)
	region.AssignHexagon(hexagon.NeighborSouthWest)
	region.AssignHexagon(hexagon.NeighborSouth)
	region.AssignHexagon(hexagon.NeighborSouthEast)

	region.AssignHexagon(hexagon.NeighborNorth.NeighborNorthWest)
	region.AssignHexagon(hexagon.NeighborNorth.NeighborNorth)
	region.AssignHexagon(hexagon.NeighborNorth.NeighborNorthEast)
	region.AssignHexagon(hexagon.NeighborSouth.NeighborSouthWest)
	region.AssignHexagon(hexagon.NeighborSouth.NeighborSouth)
	region.AssignHexagon(hexagon.NeighborSouth.NeighborSouthEast)
	region.AssignHexagon(hexagon.NeighborNorthWest.NeighborNorthWest)
	region.AssignHexagon(hexagon.NeighborNorthWest.NeighborSouthWest)
	region.AssignHexagon(hexagon.NeighborSouthWest.NeighborSouthWest)
	region.AssignHexagon(hexagon.NeighborNorthEast.NeighborNorthEast)
	region.AssignHexagon(hexagon.NeighborNorthEast.NeighborSouthEast)
	region.AssignHexagon(hexagon.NeighborSouthEast.NeighborSouthEast)

	ccs.Continent.regions = append(ccs.Continent.regions, region)
	ccs.SetRegion(gridX, gridY, region)
}
