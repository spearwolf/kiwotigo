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

const (
	regionHexagonCap       uint = 512
	regionNeighborsCap     uint = 512
	regionLessNeighborsCap uint = 512
)

type Region struct {
	hexagons  []*Hexagon
	neighbors []*Region
}

func NewRegion() (region *Region) {
	region = new(Region)
	region.hexagons = make([]*Hexagon, 0, regionHexagonCap)
	region.neighbors = make([]*Region, 0, regionNeighborsCap)
	return
}

func (region *Region) AssignHexagon(hex *Hexagon) *Region {
	if hex.Region != nil {
		panic("Hexagon already has a Region, cannot reassign")
	}
	hex.Region = region
	region.hexagons = append(region.hexagons, hex)
	if hex.NeighborNorth != nil {
		region.addNeighbor(hex.NeighborNorth.Region)
	}
	if hex.NeighborSouth != nil {
		region.addNeighbor(hex.NeighborSouth.Region)
	}
	if hex.NeighborNorthEast != nil {
		region.addNeighbor(hex.NeighborNorthEast.Region)
	}
	if hex.NeighborNorthWest != nil {
		region.addNeighbor(hex.NeighborNorthWest.Region)
	}
	if hex.NeighborSouthEast != nil {
		region.addNeighbor(hex.NeighborSouthEast.Region)
	}
	if hex.NeighborSouthWest != nil {
		region.addNeighbor(hex.NeighborSouthWest.Region)
	}
	return region
}

func (region *Region) AssignHexagons(hexagons []*Hexagon) *Region {
	for _, hex := range hexagons {
		region.AssignHexagon(hex)
	}
	return region
}

func (region *Region) IsNeighbor(other *Region) bool {
	for _, r := range region.neighbors {
		if r == other {
			return true
		}
	}
	return false
}

func (region *Region) addNeighbor(neighbor *Region) *Region {
	if neighbor != nil && !region.IsNeighbor(neighbor) {
		region.neighbors = append(region.neighbors, neighbor)
		neighbor.neighbors = append(neighbor.neighbors, region)
	}
	return region
}

func isNotInside(hexagons []*Hexagon, hex *Hexagon) bool {
	for _, h := range hexagons {
		if hex == h {
			return false
		}
	}
	return true
}

func appendIfNotInside(hexagons []*Hexagon, hex *Hexagon) []*Hexagon {
	if isNotInside(hexagons, hex) {
		return append(hexagons, hex)
	}
	return hexagons
}

func (region *Region) RegionLessNeighborHexagons() (regionLess []*Hexagon) {
	regionLess = make([]*Hexagon, 0, regionLessNeighborsCap)
	for _, hex := range region.hexagons {
		if hex.NeighborNorth != nil && hex.NeighborNorth.Region == nil {
			regionLess = appendIfNotInside(regionLess, hex.NeighborNorth)
		}
		if hex.NeighborNorthEast != nil && hex.NeighborNorthEast.Region == nil {
			regionLess = appendIfNotInside(regionLess, hex.NeighborNorthEast)
		}
		if hex.NeighborNorthWest != nil && hex.NeighborNorthWest.Region == nil {
			regionLess = appendIfNotInside(regionLess, hex.NeighborNorthWest)
		}
		if hex.NeighborSouth != nil && hex.NeighborSouth.Region == nil {
			regionLess = appendIfNotInside(regionLess, hex.NeighborSouth)
		}
		if hex.NeighborSouthEast != nil && hex.NeighborSouthEast.Region == nil {
			regionLess = appendIfNotInside(regionLess, hex.NeighborSouthEast)
		}
		if hex.NeighborSouthWest != nil && hex.NeighborSouthWest.Region == nil {
			regionLess = appendIfNotInside(regionLess, hex.NeighborSouthWest)
		}
	}
	return
}

func (region *Region) isMarginal(hex *Hexagon) bool {
	return hex == nil || hex.Region == nil || hex.Region != region
}

func (region *Region) ShapeHexagons() (shape []*Hexagon) {
	shape = make([]*Hexagon, 0, regionShapeHexagonsCap)
	for _, hex := range region.hexagons {
		if region.isMarginal(hex.NeighborNorth) || region.isMarginal(hex.NeighborNorthEast) || region.isMarginal(hex.NeighborSouthEast) || region.isMarginal(hex.NeighborSouth) || region.isMarginal(hex.NeighborSouthWest) || region.isMarginal(hex.NeighborNorthWest) {
			shape = append(shape, hex)
		}
	}
	return
}

func (region *Region) SingleRandomShapeHexagon() *Hexagon {
	for i := len(region.hexagons) - 1; i >= 0; i-- {
		hex := region.hexagons[i]
		if region.isMarginal(hex.NeighborNorth) || region.isMarginal(hex.NeighborNorthEast) || region.isMarginal(hex.NeighborSouthEast) || region.isMarginal(hex.NeighborSouth) || region.isMarginal(hex.NeighborSouthWest) || region.isMarginal(hex.NeighborNorthWest) {
			return hex
		}
	}
	return nil
}
