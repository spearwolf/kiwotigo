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

type RegionGroup struct {
	Regions []*Region
}

func NewRegionGroup(maxRegionCount int) (group *RegionGroup) {
	group = new(RegionGroup)
	group.Regions = make([]*Region, 0, maxRegionCount)
	return group
}

func (group *RegionGroup) IsInside(region *Region) bool {
	for _, reg := range group.Regions {
		if reg == region {
			return true
		}
	}
	return false
}

func (group *RegionGroup) IsOverlapping(other *RegionGroup) bool {
	for _, region := range other.Regions {
		if group.IsInside(region) {
			return true
		} else {
			for _, neighbor := range region.neighbors {
				if group.IsInside(neighbor) {
					return true
				}
			}
		}
	}
	return false
}

func (group *RegionGroup) Merge(other *RegionGroup) {
	for _, region := range other.Regions {
		group.Append(region)
	}
}

func (group *RegionGroup) Append(region *Region) {
	if group.IsInside(region) {
		return
	}
	group.Regions = append(group.Regions, region)
	for _, neighbor := range region.neighbors {
		group.Append(neighbor)
	}
}
