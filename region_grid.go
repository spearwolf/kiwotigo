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

type RegionGrid struct {
	width, height uint
	regions       []*Region
}

func NewRegionGrid(width, height uint) *RegionGrid {
	grid := new(RegionGrid)
	grid.width = width
	grid.height = height
	grid.regions = make([]*Region, width*height)
	return grid
}

func (grid *RegionGrid) Width() uint {
	return grid.width
}

func (grid *RegionGrid) Height() uint {
	return grid.height
}

func (grid *RegionGrid) regionsIndex(x, y uint) uint {
	return y*grid.width + x
}

func (grid *RegionGrid) IsInsideGrid(x, y uint) bool {
	return x >= 0 && x < grid.width && y >= 0 && y < grid.height
}

func (grid *RegionGrid) Region(x, y uint) *Region {
	return grid.regions[grid.regionsIndex(x, y)]
}

func (grid *RegionGrid) hasRegion(x, y uint) bool {
	return nil != grid.regions[grid.regionsIndex(x, y)]
}

func (grid *RegionGrid) SetRegion(x, y uint, region *Region) *RegionGrid {
	grid.regions[grid.regionsIndex(x, y)] = region
	return grid
}
