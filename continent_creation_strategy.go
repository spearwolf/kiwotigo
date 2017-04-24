/*
	Copyright (C) 2014-2017 Wolfger Schramm <wolfger@spearwolf.de>

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
	CreateRegionHintsGrid
	ContinentConfig
	rand                      *rand.Rand
	Continent                 *Continent
	probabilityCreateRegionAt float64
	growableRegion            map[*Region]bool
	MaxRegionSize             int
	groups                    []*RegionGroup
}

func NewContinentCreationStrategy(cfg ContinentConfig) (strategy *ContinentCreationStrategy) {
	strategy = new(ContinentCreationStrategy)
	strategy.ContinentConfig = cfg
	strategy.rand = rand.New(rand.NewSource(time.Now().UnixNano()))
	strategy.RegionGrid = *NewRegionGrid(cfg.GridWidth, cfg.GridHeight)
	strategy.CreateRegionHintsGrid = *NewCreateRegionHintsGrid(strategy.rand, cfg.GridWidth, cfg.GridHeight, cfg.DivisibilityBy, cfg.ProbabilityCreateRegionAt)

	cols := cfg.GridOuterPaddingX*2 + cfg.GridWidth*cfg.GridHexWidth + cfg.GridInnerPaddingX*(cfg.GridWidth-1)
	rows := cfg.GridOuterPaddingY*2 + cfg.GridHeight*cfg.GridHexHeight + cfg.GridInnerPaddingY*(cfg.GridHeight-1)
	strategy.Continent = NewContinent(cols, rows, cfg.HexWidth, cfg.HexHeight, cfg.HexPaddingX, cfg.HexPaddingY)
	strategy.Continent.regions = make([]*Region, 0, cfg.GridWidth*cfg.GridHeight)

	strategy.probabilityCreateRegionAt = cfg.ProbabilityCreateRegionAt
	strategy.growableRegion = make(map[*Region]bool)
	return
}

func (strategy *ContinentCreationStrategy) BuildContinent() *Continent {

	strategy.fillGridWithRegions()
	strategy.fastGrowAllRegions()

	//strategy.Continent.CreateShapes("basePath")

	strategy.growAllRegions()

	strategy.closeHolesInAllRegions()
	strategy.Continent.CreateShapes("basePath")

	strategy.growLonelyRegionsUntilTheyAreFatOrHaveNeighbors()

	// TODO
	// - [ ]  strategy
	//    - [x]  define target region count constraint: even/odd/number/dividable-by-number...
	//    - [x]  fast grow regions until all have a neighbor and region-groups connected
	//    - [ ]  allow pre-defined region grid masks (or a region grid coords blacklist)
	//    - [ ]  fix Region.SingleRandomShapeHexagon()
	// - [x]  toJson
	//    - [x]  export config
	//    - [x]  export region size (hexagon count)

	strategy.Continent.UpdateCenterPoints(strategy.FastGrowIterations)

	for {
		strategy.createOrUpdateRegionGroups()

		if len(strategy.groups) == 1 {
			break
		}

		growableRegions := strategy.filterGrowableRegions()
		if len(growableRegions) == 0 {
			break
		}

		strategy.updateMaxRegionSize()
		for _, region := range growableRegions {
			strategy.growRegion(region)
		}

		strategy.closeHolesInAllRegions()
	}

	strategy.Continent.CreateShapes("fullPath")

	strategy.Continent.MakeNeighbors()
	strategy.Continent.UpdateRegionSizes()

	return strategy.Continent
}

func (strategy *ContinentCreationStrategy) createOrUpdateRegionGroups() {
	if strategy.groups == nil {
		strategy.groups = make([]*RegionGroup, 0, len(strategy.Continent.regions))
	}

	for _, region := range strategy.Continent.regions {
		if len(strategy.groups) == 0 || len(region.neighbors) == 0 || !strategy.hasGroup(region) {
			strategy.addNewRegionGroup(region)
		}
	}

	mergedGroups := make([]*RegionGroup, 0, len(strategy.groups))

strategyGroups:
	for _, group := range strategy.groups {
		if len(mergedGroups) == 0 {
			mergedGroups = append(mergedGroups, group)
		} else {
			for _, merged := range mergedGroups {
				if merged.IsOverlapping(group) {
					merged.Merge(group)
					continue strategyGroups
				}
			}
			mergedGroups = append(mergedGroups, group)
		}
	}
	strategy.groups = mergedGroups
}

func (strategy *ContinentCreationStrategy) hasGroup(region *Region) bool {
	for _, group := range strategy.groups {
		if group.IsInside(region) {
			return true
		}
	}
	return false
}

func (strategy *ContinentCreationStrategy) addNewRegionGroup(region *Region) {
	group := NewRegionGroup(len(strategy.Continent.regions))
	group.Append(region)
	strategy.groups = append(strategy.groups, group)
}

func (strategy *ContinentCreationStrategy) shouldCreateRegionAt(x, y uint) bool {
	return strategy.CreateRegionHintsGrid.ShouldCreateRegion(x, y)
}

type gridRegionFn func(x, y uint, region *Region)

func (strategy *ContinentCreationStrategy) ForEachGridRegion(fn gridRegionFn) {
	var x, y uint
	gridWidth, gridHeight := strategy.Width(), strategy.Height()
	for y = 0; y < gridHeight; y++ {
		for x = 0; x < gridWidth; x++ {
			fn(x, y, strategy.Region(x, y))
		}
	}
}

func (strategy *ContinentCreationStrategy) fillGridWithRegions() {
	strategy.ForEachGridRegion(func(x, y uint, _ *Region) {
		if strategy.shouldCreateRegionAt(x, y) {
			strategy.initializeRegionAt(x, y)
		}
	})
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

func (strategy *ContinentCreationStrategy) regionLessWithNeighborWithRegionCount(region *Region, minNeighborWithRegionCount uint) []*Hexagon {
	return filterHexagonsWithNeighborCount(region.RegionLessNeighborHexagons(), minNeighborWithRegionCount)
}

func (strategy *ContinentCreationStrategy) closeHolesInAllRegions() {
	var i uint
	for i = 0; i < strategy.FastGrowIterations; i++ {
		for _, region := range strategy.Continent.regions {
			for {
				regionLess := strategy.regionLessWithNeighborWithRegionCount(region, 5)
				if len(regionLess) > 0 {
					region.AssignHexagons(regionLess)
				} else {
					break
				}
			}
		}
	}
}

func (strategy *ContinentCreationStrategy) fastGrowAllRegions() {
	var i uint
	for i = 0; i < strategy.FastGrowIterations; i++ {
		for _, region := range strategy.Continent.regions {
			strategy.fastGrowRegion(region)
		}
	}
}

func (strategy *ContinentCreationStrategy) growAllRegions() {
	var i uint
	for i = 0; i < strategy.MinimalGrowIterations; i++ {
		for _, region := range strategy.Continent.regions {
			strategy.growRegion(region)
		}
	}
}

func (strategy *ContinentCreationStrategy) filterOutFatRegions(regions []*Region) []*Region {
	slimRegions := make([]*Region, 0, len(regions))
	for _, slim := range regions {
		if slim.RegionSize() < strategy.MaxRegionSize {
			slimRegions = append(slimRegions, slim)
		}
	}
	return slimRegions
}

func (strategy *ContinentCreationStrategy) growLonelyRegionsUntilTheyAreFatOrHaveNeighbors() {
	if strategy.MaxRegionSizeFactor > 0 {
		strategy.updateMaxRegionSize()
	} else {
		return
	}
	for {
		lonely := strategy.filterOutFatRegions(strategy.Continent.NeighborLessRegions())
		if len(lonely) == 0 {
			break
		}
		for _, region := range lonely {
			strategy.growRegion(region)
		}
	}
}

func (strategy *ContinentCreationStrategy) updateMaxRegionSize() {
	if strategy.MaxRegionSizeFactor > 0 {
		strategy.MaxRegionSize = int(math.Floor(strategy.MaxRegionSizeFactor * float64(strategy.Continent.MinRegionSize())))
	}
}

func (strategy *ContinentCreationStrategy) filterGrowableRegions() []*Region {
	growables := make([]*Region, 0, len(strategy.Continent.regions))
	for region, isGrowable := range strategy.growableRegion {
		if isGrowable {
			growables = append(growables, region)
		}
	}
	return growables
}

func (strategy *ContinentCreationStrategy) fastGrowRegion(region *Region) {
	regionLess := region.RegionLessNeighborHexagons()
	region.AssignHexagons(regionLess)
}

func (strategy *ContinentCreationStrategy) growRegion(region *Region) {

	isGrowable, exists := strategy.growableRegion[region]
	if isGrowable || !exists {

		hexagons := strategy.regionLessWithNeighborWithRegionCount(region, 5)
		if len(hexagons) > 0 {
			region.AssignHexagons(hexagons)
		}

		hexagons = strategy.regionLessWithNeighborWithRegionCount(region, 2)
		if len(hexagons) > 0 {
			region.AssignHexagon(hexagons[strategy.rand.Intn(len(hexagons))])
		}

		hexagons = strategy.regionLessWithNeighborWithRegionCount(region, 1)
		if len(hexagons) > 0 {
			region.AssignHexagon(hexagons[strategy.rand.Intn(len(hexagons))])
		}

		growable := len(region.RegionLessNeighborHexagons()) > 0

		if strategy.MaxRegionSize > 0 && growable && region.RegionSize() >= strategy.MaxRegionSize {
			growable = false
		}

		strategy.growableRegion[region] = growable

	}

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
func (strategy *ContinentCreationStrategy) initializeRegionAt(gridX, gridY uint) {
	var x, y uint
	x = strategy.GridOuterPaddingX + (strategy.GridHexWidth+strategy.GridInnerPaddingX)*gridX + uint(strategy.rand.Intn(int(strategy.GridHexWidth)-4)+2)
	y = strategy.GridOuterPaddingY + (strategy.GridHexHeight+strategy.GridInnerPaddingY)*gridY + uint(strategy.rand.Intn(int(strategy.GridHexWidth)-4)+2)

	region := new(Region)
	hexagon := strategy.Continent.model.Hexagon(x, y)

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

	strategy.Continent.regions = append(strategy.Continent.regions, region)
	strategy.SetRegion(gridX, gridY, region)
}
