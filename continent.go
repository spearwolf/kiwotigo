package kiwotigo

import (
	"encoding/json"
)

type Continent struct {
	Width   uint         `json:"width"`
	Height  uint         `json:"height"`
	Shapes  []*[]*Vertex `json:"shapes"`
	model   *HexagonModel
	regions []*Region
}

func NewContinent(rows, cols, hexWidth, hexHeight, paddingX, paddingY uint) (continent *Continent) {
	continent = new(Continent)
	continent.model = NewHexagonModel(rows, cols, hexWidth, hexHeight, paddingX, paddingY)
	continent.Width = continent.model.CanvasWidth()
	continent.Height = continent.model.CanvasHeight()
	return
}

func (continent *Continent) Json() string {
	json, _ := json.Marshal(continent)
	return string(json)
}

func (continent *Continent) CreateAllShapes() {
	continent.Shapes = make([]*[]*Vertex, 0, len(continent.regions))
	for _, region := range continent.regions {
		shape := region.CreateShapePath()
		continent.Shapes = append(continent.Shapes, shape)
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
