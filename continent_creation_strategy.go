/*
	Copyright (C) 2014 Wolfger Schramm <wolfger@spearwolf.de>

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

package kiwotigo

import (
	"math"
	"math/rand"
	"time"
)

type ContinentCreationStrategy struct {
	RegionGrid
	ContinentConfig
	rand                      *rand.Rand
	Continent                 *Continent
	probabilityCreateRegionAt float64
	growableRegion            map[*Region]bool
	MaxRegionSize             int
}

func NewContinentCreationStrategy(cfg ContinentConfig) (ccs *ContinentCreationStrategy) {
	ccs = new(ContinentCreationStrategy)
	ccs.ContinentConfig = cfg
	ccs.rand = rand.New(rand.NewSource(time.Now().UnixNano()))
	ccs.RegionGrid = *NewRegionGrid(cfg.GridWidth, cfg.GridHeight)

	cols := cfg.GridOuterPaddingX*2 + cfg.GridWidth*cfg.GridHexWidth + cfg.GridInnerPaddingX*(cfg.GridWidth-1)
	rows := cfg.GridOuterPaddingY*2 + cfg.GridHeight*cfg.GridHexHeight + cfg.GridInnerPaddingY*(cfg.GridHeight-1)
	ccs.Continent = NewContinent(cols, rows, cfg.HexWidth, cfg.HexHeight, cfg.HexPaddingX, cfg.HexPaddingY)
	ccs.Continent.regions = make([]*Region, 0, cfg.GridWidth*cfg.GridHeight)

	ccs.probabilityCreateRegionAt = 0.5
	ccs.growableRegion = make(map[*Region]bool)
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
	ccs.ensureAtLeastOneRegionExistsInsideContiguity()
	ccs.Continent.CreateShapes("basePath")
	ccs.fastGrowAllRegions()
	ccs.growAllRegions()
	ccs.growLonelyRegionsUntilTheyAreFatOrHaveNeighbors()
	ccs.closeHolesInAllRegions()
	ccs.Continent.CreateShapes("fullPath")
}

func filterHexagonsWithNeighborCount(hexagons []*Hexagon, neighborMinCount uint) []*Hexagon {
	res := make([]*Hexagon, 0, len(hexagons))
	for _, hex := range hexagons {
		count := hex.NeighborsWithRegionCount()
		if count >= neighborMinCount {
			res = append(res, hex)
		}
	}
	return res
}

func (ccs *ContinentCreationStrategy) regionLessWithNeighborWithRegionCount(region *Region, minNeighborWithRegionCount uint) []*Hexagon {
	return filterHexagonsWithNeighborCount(region.RegionLessNeighborHexagons(), minNeighborWithRegionCount)
}

func (ccs *ContinentCreationStrategy) closeHolesInAllRegions() {
	var i uint
	for i = 0; i < ccs.FastGrowIterations; i++ {
		for _, region := range ccs.Continent.regions {
			for {
				regionLess := ccs.regionLessWithNeighborWithRegionCount(region, 5)
				if len(regionLess) > 0 {
					region.AssignHexagons(regionLess)
				} else {
					break
				}
			}
		}
	}
}

func (ccs *ContinentCreationStrategy) fastGrowAllRegions() {
	var i uint
	for i = 0; i < ccs.FastGrowIterations; i++ {
		for _, region := range ccs.Continent.regions {
			ccs.fastGrowRegion(region)
		}
	}
}

func (ccs *ContinentCreationStrategy) growAllRegions() {
	var i uint
	for i = 0; i < ccs.MinimalGrowIterations; i++ {
		for _, region := range ccs.Continent.regions {
			ccs.growRegion(region)
		}
	}
}

func (ccs *ContinentCreationStrategy) filterOutFatRegions(regions []*Region) []*Region {
	slimRegions := make([]*Region, 0, len(regions))
	for _, slim := range regions {
		if slim.RegionSize() < ccs.MaxRegionSize {
			slimRegions = append(slimRegions, slim)
		}
	}
	return slimRegions
}

func (ccs *ContinentCreationStrategy) growLonelyRegionsUntilTheyAreFatOrHaveNeighbors() {
	if ccs.MaxRegionSizeFactor > 0 {
		ccs.MaxRegionSize = int(math.Floor(ccs.MaxRegionSizeFactor * float64(ccs.Continent.MinRegionSize())))
	} else {
		return
	}
	for {
		lonely := ccs.filterOutFatRegions(ccs.Continent.NeighborLessRegions())
		if len(lonely) == 0 {
			break
		}
		for _, region := range lonely {
			ccs.growRegion(region)
		}
	}
}

func (ccs *ContinentCreationStrategy) fastGrowRegion(region *Region) {
	regionLess := region.RegionLessNeighborHexagons()
	region.AssignHexagons(regionLess)
}

func (ccs *ContinentCreationStrategy) growRegion(region *Region) {
	isGrowable, exists := ccs.growableRegion[region]
	if isGrowable || !exists {

		hexagons := ccs.regionLessWithNeighborWithRegionCount(region, 5)
		if len(hexagons) > 0 {
			region.AssignHexagons(hexagons)
		}

		hexagons = ccs.regionLessWithNeighborWithRegionCount(region, 2)
		if len(hexagons) > 0 {
			region.AssignHexagon(hexagons[ccs.rand.Intn(len(hexagons))])
		}

		growable := len(region.RegionLessNeighborHexagons()) > 0
		if ccs.MaxRegionSize > 0 && growable && region.RegionSize() >= ccs.MaxRegionSize {
			growable = false
		}
		ccs.growableRegion[region] = growable
	}
}

func (ccs *ContinentCreationStrategy) ensureAtLeastOneRegionExistsInsideContiguity() {
	ccs.ForEachGridRegion(func(x, y uint, region *Region) {
		if region != nil {
			neighborPositions := [...]Position{
				Position{X: x - 1, Y: y - 1},
				Position{X: x, Y: y - 1},
				Position{X: x + 1, Y: y - 1},
				Position{X: x + 1, Y: y},
				Position{X: x + 1, Y: y + 1},
				Position{X: x, Y: y + 1},
				Position{X: x - 1, Y: y + 1},
				Position{X: x - 1, Y: y}}
			//neighborPositions := [...]Position{
			//Position{X: x, Y: y - 1},
			//Position{X: x, Y: y + 1}}
			freeNeighbors := make([]Position, 0, len(neighborPositions))
			regionCount := 0
			for _, pos := range neighborPositions {
				if ccs.IsInsideGrid(pos.X, pos.Y) {
					if ccs.Region(pos.X, pos.Y) != nil {
						regionCount++
					} else {
						freeNeighbors = append(freeNeighbors, pos)
					}
				}
			}
			if regionCount == 0 {
				if len(freeNeighbors) > 0 {
					pos := freeNeighbors[ccs.rand.Intn(len(freeNeighbors))]
					ccs.initializeRegionAt(pos.X, pos.Y)
				} else {
					panic("No Region inside contiguity but no free neighbors available?")
				}
			}
		}
	})
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
	x = ccs.GridOuterPaddingX + (ccs.GridHexWidth+ccs.GridInnerPaddingX)*gridX + uint(ccs.rand.Intn(int(ccs.GridHexWidth)-4)+2)
	y = ccs.GridOuterPaddingY + (ccs.GridHexHeight+ccs.GridInnerPaddingY)*gridY + uint(ccs.rand.Intn(int(ccs.GridHexWidth)-4)+2)

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
