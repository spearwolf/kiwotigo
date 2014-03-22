package kiwotigo

import (
	"math/rand"
	"time"
)

type ContinentCreationStrategy struct {
	RegionGrid
	r                          *rand.Rand
	gridHexWidth, gridHexHeigt uint
	Continent                  *Continent
	probabilityCreateRegionAt  float64
}

func NewContinentCreationStrategy(gridWidth, gridHeight, gridHexWidth, gridHexHeigt, hexWidth, hexHeight, paddingX, paddingY uint) (ccs *ContinentCreationStrategy) {
	ccs = new(ContinentCreationStrategy)
	ccs.r = rand.New(rand.NewSource(time.Now().UnixNano()))
	ccs.RegionGrid = *NewRegionGrid(gridWidth, gridHeight)
	ccs.Continent = NewContinent(gridWidth*gridHexWidth, gridHeight*gridHexHeigt, hexWidth, hexHeight, paddingX, paddingY)
	ccs.probabilityCreateRegionAt = 0.5
	return
}

func (ccs *ContinentCreationStrategy) shouldCreateRegionAt(x, y uint) bool {
	if ccs.hasRegion(x, y) {
		return false
	}
	return ccs.r.Float64() < ccs.probabilityCreateRegionAt
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
			ccs.SetRegion(x, y, new(Region))
		}
	})
}

func (ccs *ContinentCreationStrategy) CreateRegions() {
	ccs.fillGridWithRegions()
}
