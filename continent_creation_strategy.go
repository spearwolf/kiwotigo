package kiwotigo

import (
	"math/rand"
	"time"
)

type ContinentCreationStrategy struct {
	r                          *rand.Rand
	grid                       *RegionGrid
	gridHexWidth, gridHexHeigt uint
	Continent                  *Continent
	probabilityCreateRegionAt  float64
}

func NewContinentCreationStrategy(gridWidth, gridHeight, gridHexWidth, gridHexHeigt, hexWidth, hexHeight, paddingX, paddingY uint) (ccs *ContinentCreationStrategy) {
	ccs = new(ContinentCreationStrategy)
	ccs.r = rand.New(rand.NewSource(time.Now().UnixNano()))
	ccs.grid = NewRegionGrid(gridWidth, gridHeight)
	ccs.Continent = NewContinent(gridWidth*gridHexWidth, gridHeight*gridHexHeigt, hexWidth, hexHeight, paddingX, paddingY)
	ccs.probabilityCreateRegionAt = 0.5
	return
}

func (ccs *ContinentCreationStrategy) shouldCreateRegionAt(x, y uint) bool {
	if ccs.grid.hasRegion(x, y) {
		return false
	}
	return ccs.r.Float64() < ccs.probabilityCreateRegionAt
}

func (ccs *ContinentCreationStrategy) fillGridWithRegions() {
	var x, y uint
	gridWidth, gridHeight := ccs.grid.Width(), ccs.grid.Height()
	for y = 0; y < gridHeight; y++ {
		for x = 0; x < gridWidth; x++ {
			if ccs.shouldCreateRegionAt(x, y) {
				ccs.grid.SetRegion(x, y, new(Region))
			}
		}
	}
}

func (ccs *ContinentCreationStrategy) CreateRegions() {
	ccs.fillGridWithRegions()
}
