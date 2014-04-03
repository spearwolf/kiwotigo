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
)

type Continent struct {
	Width        uint                    `json:"width"`
	Height       uint                    `json:"height"`
	Shapes       []map[string]*[]*Vertex `json:"regions"`
	CenterPoints []Vertex                `json:"centerPoints"`
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

func (continent *Continent) UpdateCenterPoints() {
	if continent.CenterPoints == nil {
		continent.CenterPoints = make([]Vertex, len(continent.regions))
	}
	for i, region := range continent.regions {
		continent.CenterPoints[i] = region.hexagons[0].CenterPoint
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
