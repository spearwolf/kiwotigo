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

type RegionShape struct {
	region         *Region
	visitedEdges   map[*Hexagon]*[6]bool
	shapePath      []*Vertex
	startEdgeOrder []int
}

var nextEdgeMap [6]int = [...]int{4, 5, 0, 1, 2, 3}
var defaultEdgeOrder []int = []int{0, 1, 2, 3, 4, 5}

func NewRegionShape(region *Region, shapeEdgeOrder *[]int) (shape *RegionShape) {
	shape = new(RegionShape)
	shape.region = region
	shape.visitedEdges = make(map[*Hexagon]*[6]bool)
	shape.shapePath = make([]*Vertex, 0)

	edgeOrder := shapeEdgeOrder
	if shapeEdgeOrder == nil {
		edgeOrder = &defaultEdgeOrder
	}
	shape.startEdgeOrder = make([]int, len(*edgeOrder))
	copy(shape.startEdgeOrder, *edgeOrder)

	return
}

func CreateShapePath(region *Region, shapeEdgeOrder *[]int) *[]*Vertex {
	return NewRegionShape(region, shapeEdgeOrder).CreatePath()
}

func (shape *RegionShape) CreatePath() *[]*Vertex {
	var edge int
	hexagon := shape.region.SingleRandomShapeHexagon()
	hexagon, edge = shape.nextHexagonEdge(hexagon, -1)
	for hexagon != nil {
		hexagon, edge = shape.nextHexagonEdge(hexagon, edge)
	}
	return &shape.shapePath
}

func (_ *RegionShape) isOtherRegion(a, b *Region) bool {
	return a == nil || b == nil || a != b
}

func (shape *RegionShape) neighborHasOtherRegion(hexagon *Hexagon, neighborIndex int) bool {
	hex := hexagon.Neighbor(neighborIndex)
	return hex == nil || shape.isOtherRegion(hex.Region, hexagon.Region)
}

func (shape *RegionShape) nextHexagonEdge(hexagon *Hexagon, startAtEdge int) (*Hexagon, int) {
	//
	//       _1_
	//     2/   \0
	//     3\___/5
	//        4
	//

	var i int

	// find startAtEdge
	if startAtEdge < 0 {
		var i, edgeIndex int
		for i, edgeIndex = range shape.startEdgeOrder {
			//for i = 0; i < 6; i++ {
			hex := hexagon.Neighbor(edgeIndex)
			if hex == nil || shape.isOtherRegion(hex.Region, hexagon.Region) {
				break
			}
		}
		if i < len(shape.startEdgeOrder) {
			startAtEdge = edgeIndex
		} else {
			return nil, -1
		}
	}

	// hexagon->visitedEdges
	visitedEdges, exists := shape.visitedEdges[hexagon]
	if !exists {
		shape.visitedEdges[hexagon] = new([6]bool)
		visitedEdges = shape.visitedEdges[hexagon]
	}

	var edge int

	for i = 0; i < 6; i++ {
		edge = (startAtEdge + i) % 6

		if visitedEdges[edge] {
			return nil, -1
		}
		visitedEdges[edge] = true

		if shape.neighborHasOtherRegion(hexagon, edge) {
			break
		}
	}
	if i == 6 {
		return nil, 1
	}

	// edge <= first edge with adjacent (different|none) region
	for {
		shape.shapePath = append(shape.shapePath, hexagon.VertexCoord(edge))
		visitedEdges[edge] = true
		edge = (edge + 1) % 6
		if !(!visitedEdges[edge] && shape.neighborHasOtherRegion(hexagon, edge)) {
			break
		}
	}

	if edge == startAtEdge || visitedEdges[edge] {
		return nil, -1
	}

	return hexagon.Neighbor(edge), nextEdgeMap[edge]
}
