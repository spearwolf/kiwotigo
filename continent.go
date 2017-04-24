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
	"encoding/json"
	"math"
)

type Continent struct {
	Width        uint                    `json:"width"`
	Height       uint                    `json:"height"`
	Shapes       []map[string]*[]*Vertex `json:"regions"`
	CenterPoints []CenterPoint           `json:"centerPoints"`
	RegionSizes  []float64               `json:"regionSizes"`
	Neighbors    []*[]int                `json:"neighbors"`
	model        *HexagonModel
	regions      []*Region
}

func NewContinent(cols, rows, hexWidth, hexHeight, paddingX, paddingY uint) (continent *Continent) {
	continent = new(Continent)
	continent.model = NewHexagonModel(cols, rows, hexWidth, hexHeight, paddingX, paddingY)
	continent.Width = continent.model.CanvasWidth()
	continent.Height = continent.model.CanvasHeight()
	return
}

func (continent *Continent) Json() string {
	json, _ := json.Marshal(continent)
	return string(json)
}

func (continent *Continent) CreateShapes(shapeName string) {
	if continent.Shapes == nil {
		continent.Shapes = make([]map[string]*[]*Vertex, len(continent.regions))
		for i, _ := range continent.regions {
			continent.Shapes[i] = make(map[string]*[]*Vertex)
		}
	}
	for i, region := range continent.regions {
		shape := CreateShapePath(region)
		continent.Shapes[i][shapeName] = shape
	}
}

func (continent *Continent) MinRegionSize() int {
	min := -1
	for _, region := range continent.regions {
		count := region.RegionSize()
		if min == -1 {
			min = count
		} else if count < min {
			min = count
		}
	}
	return min
}

func (continent *Continent) NeighborLessRegions() []*Region {
	neighborLessRegions := make([]*Region, 0, len(continent.regions))
	for _, region := range continent.regions {
		if len(region.neighbors) == 0 {
			neighborLessRegions = append(neighborLessRegions, region)
		}
	}
	return neighborLessRegions
}

func (continent *Continent) UpdateCenterPoints(fastGrowCount uint) {
	if continent.CenterPoints == nil {
		continent.CenterPoints = make([]CenterPoint, len(continent.regions))
	}
	for i, region := range continent.regions {
		p0 := region.hexagons[0].CenterPoint
		continent.CenterPoints[i].X = p0.X
		continent.CenterPoints[i].Y = p0.Y

		r := region.hexagons[0].NeighborNorth.NeighborNorth
		for j := 0; j < int(fastGrowCount); j++ {
			r = r.NeighborNorthWest
		}
		p1 := r.CenterPoint

		distance := math.Floor(0.5 + math.Hypot(p1.X-p0.X, p1.Y-p0.Y))
		continent.CenterPoints[i].InnerRadius = distance

		var maxOuterDistance float64
		for _, hex := range region.ShapeHexagons() {
			p1 = hex.CenterPoint
			distance = math.Floor(0.5 + math.Hypot(p1.X-p0.X, p1.Y-p0.Y))
			if distance > maxOuterDistance {
				maxOuterDistance = distance
			}
		}
		continent.CenterPoints[i].OuterRadius = maxOuterDistance
	}
}

func (continent *Continent) averageRegionSize() float64 {
	var average float64
	for _, region := range continent.regions {
		average += float64(region.RegionSize())
	}
	return average / float64(len(continent.regions))
}

func (continent *Continent) UpdateRegionSizes() {
	if continent.RegionSizes == nil {
		continent.RegionSizes = make([]float64, len(continent.regions))
	}
	sizeFactor := continent.averageRegionSize()
	for i, region := range continent.regions {
		continent.RegionSizes[i] = float64(region.RegionSize()) / sizeFactor
	}
}

func (continent *Continent) calcRegionId(region *Region) int {
	for i, reg := range continent.regions {
		if reg == region {
			return i
		}
	}
	return -1
}

func (continent *Continent) MakeNeighbors() {
	if continent.Neighbors == nil {
		continent.Neighbors = make([]*[]int, len(continent.regions))
	}
	for i, region := range continent.regions {
		neighbors := make([]int, len(region.neighbors))
		for j, neighbor := range region.neighbors {
			neighbors[j] = continent.calcRegionId(neighbor)
		}
		continent.Neighbors[i] = &neighbors
	}
}

func (continent *Continent) CreateSomeRegions() {
	continent.regions = make([]*Region, 0, 4)
	model := continent.model

	region := new(Region)
	region.AssignHexagon(model.Hexagon(1, 1))
	continent.regions = append(continent.regions, region)

	region = new(Region)
	region.AssignHexagon(model.Hexagon(3, 1))
	region.AssignHexagon(model.Hexagon(4, 2))
	continent.regions = append(continent.regions, region)

	region = new(Region)
	region.AssignHexagon(model.Hexagon(3, 6))
	region.AssignHexagon(model.Hexagon(2, 4))
	region.AssignHexagon(model.Hexagon(2, 6))
	region.AssignHexagon(model.Hexagon(0, 6))
	region.AssignHexagon(model.Hexagon(3, 4))
	region.AssignHexagon(model.Hexagon(4, 4))
	region.AssignHexagon(model.Hexagon(0, 7))
	region.AssignHexagon(model.Hexagon(1, 6))
	region.AssignHexagon(model.Hexagon(1, 4))
	region.AssignHexagon(model.Hexagon(1, 5))
	region.AssignHexagon(model.Hexagon(3, 5))
	region.AssignHexagon(model.Hexagon(4, 5))
	region.AssignHexagon(model.Hexagon(0, 5))
	region.AssignHexagon(model.Hexagon(2, 5))
	region.AssignHexagon(model.Hexagon(4, 6))
	continent.regions = append(continent.regions, region)

	region = new(Region)
	region.AssignHexagon(model.Hexagon(5, 4))
	region.AssignHexagon(model.Hexagon(5, 5))
	region.AssignHexagon(model.Hexagon(5, 6))
	region.AssignHexagon(model.Hexagon(4, 7))
	region.AssignHexagon(model.Hexagon(6, 7))
	region.AssignHexagon(model.Hexagon(7, 6))
	continent.regions = append(continent.regions, region)
}
