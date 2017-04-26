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
	"fmt"
	"testing"
)

func makeHexagonModel() *HexagonModel {
	return NewHexagonModel(10, 10, 20, 20, 0, 0)
}

func testHexagonRowCol(t *testing.T, model *HexagonModel, col, row uint) {
	hex := model.Hexagon(col, row)
	if hex == nil {
		t.Error("Hexagon at [", col, ",", row, "] should exists")
	}
	if hex.Row != row {
		t.Error("Hexagon.Row at [", col, ",", row, "] expected", row, ", got", hex.Row)
	}
	if hex.Col != col {
		t.Error("Hexagon.Col at [", col, ",", row, "] expected", col, ", got", hex.Col)
	}
}

func TestHexagonModelGetHexagon(t *testing.T) {

	model := makeHexagonModel()

	testHexagonRowCol(t, model, 0, 0)
	testHexagonRowCol(t, model, 0, 9)
	testHexagonRowCol(t, model, 9, 0)
	testHexagonRowCol(t, model, 9, 9)

	hex := model.Hexagon(10, 10)
	if hex != nil {
		t.Error("Hexagon at [10, 10] expected nil, got", hex)
	}
}

//     __    __    __    __    __
//    /0 \__/2 \__/  \__/  \__/8 \__
//    \_0/1 \_0/  \__/  \__/  \_0/9 \
//    /0 \_0/  \__/  \__/  \__/8 \_0/
//    \_1/1 \__/  \__/  \__/  \_1/9 \
//    /  \_1/  \__/  \__/  \__/  \_1/
//    \__/  \__/  \__/  \__/  \__/  \
//    /  \__/  \__/  \__/  \__/  \__/
//    \__/  \__/  \__/  \__/  \__/  \
//    /  \__/  \__/  \__/  \__/  \__/
//    \__/  \__/  \__/  \__/  \__/  \
//    /  \__/  \__/  \__/  \__/  \__/
//    \__/  \__/  \__/  \__/  \__/  \
//    /  \__/  \__/  \__/  \__/  \__/
//    \__/  \__/  \__/  \__/  \__/  \
//    /  \__/  \__/  \__/  \__/  \__/
//    \__/  \__/  \__/  \__/  \__/  \
//    /0 \__/  \__/  \__/  \__/  \__/
//    \_8/1 \__/  \__/  \__/  \__/9 \
//    /0 \_8/  \__/  \__/  \__/8 \_8/
//    \_9/1 \__/  \__/  \__/  \_9/9 \
//       \_9/  \__/  \__/  \__/  \_9/
//
func TestHexagonModelNeighbors(t *testing.T) {

	model := makeHexagonModel()

	hex := model.Hexagon(0, 0)
	shouldNotExist(t, hex.NeighborNorthEast, "NeighborNorthEast")
	shouldNotExist(t, hex.NeighborNorth, "NeighborNorth")
	shouldNotExist(t, hex.NeighborNorthWest, "NeighborNorthWest")
	shouldNotExist(t, hex.NeighborSouthWest, "NeighborSouthWest")
	shouldExist(t, hex.NeighborSouth, "NeighborSouth")
	shouldExist(t, hex.NeighborSouthEast, "NeighborSouthEast")
	testNeighbor(t, hex.NeighborSouth, 0, 1, "NeighborSouth")
	testNeighbor(t, hex.NeighborSouthEast, 1, 0, "NeighborSouthEast")

	hex = model.Hexagon(0, 9)
	shouldExist(t, hex.NeighborNorthEast, "NeighborNorthEast")
	shouldExist(t, hex.NeighborNorth, "NeighborNorth")
	shouldNotExist(t, hex.NeighborNorthWest, "NeighborNorthWest")
	shouldNotExist(t, hex.NeighborSouthWest, "NeighborSouthWest")
	shouldNotExist(t, hex.NeighborSouth, "NeighborSouth")
	shouldExist(t, hex.NeighborSouthEast, "NeighborSouthEast")
	testNeighbor(t, hex.NeighborNorth, 0, 8, "NeighborNorth")
	testNeighbor(t, hex.NeighborNorthEast, 1, 8, "NeighborNorthEast")
	testNeighbor(t, hex.NeighborSouthEast, 1, 9, "NeighborSouthEast")

	hex = model.Hexagon(1, 9)
	shouldExist(t, hex.NeighborNorthEast, "NeighborNorthEast")
	shouldExist(t, hex.NeighborNorth, "NeighborNorth")
	shouldExist(t, hex.NeighborNorthWest, "NeighborNorthWest")
	shouldNotExist(t, hex.NeighborSouthWest, "NeighborSouthWest")
	shouldNotExist(t, hex.NeighborSouth, "NeighborSouth")
	shouldNotExist(t, hex.NeighborSouthEast, "NeighborSouthEast")

	hex = model.Hexagon(1, 8)
	shouldExist(t, hex.NeighborNorthEast, "NeighborNorthEast")
	shouldExist(t, hex.NeighborNorth, "NeighborNorth")
	shouldExist(t, hex.NeighborNorthWest, "NeighborNorthWest")
	shouldExist(t, hex.NeighborSouthWest, "NeighborSouthWest")
	shouldExist(t, hex.NeighborSouth, "NeighborSouth")
	shouldExist(t, hex.NeighborSouthEast, "NeighborSouthEast")

	hex = model.Hexagon(9, 9)
	shouldNotExist(t, hex.NeighborNorthEast, "NeighborNorthEast")
	shouldExist(t, hex.NeighborNorth, "NeighborNorth")
	shouldExist(t, hex.NeighborNorthWest, "NeighborNorthWest")
	shouldNotExist(t, hex.NeighborSouthWest, "NeighborSouthWest")
	shouldNotExist(t, hex.NeighborSouth, "NeighborSouth")
	shouldNotExist(t, hex.NeighborSouthEast, "NeighborSouthEast")
	testNeighbor(t, hex.NeighborNorth, 9, 8, "NeighborNorth")
	testNeighbor(t, hex.NeighborNorthWest, 8, 9, "NeighborNorthWest")
}

func testNeighbor(t *testing.T, neighbor *Hexagon, x, y uint, message string) {
	if neighbor == nil {
		t.Error("Expected", message, " Hexagon, got nil")
	}
	if x != neighbor.Col {
		t.Error("Expected", message, " Hexagon.Col=", x, ", got", neighbor.Col)
	}
	if y != neighbor.Row {
		t.Error("Expected", message, " Hexagon.Row=", y, ", got", neighbor.Row)
	}
}

func shouldNotExist(t *testing.T, neighbor *Hexagon, message string) {
	if neighbor != nil {
		t.Error("Expected", message, "to be nil, got", neighbor)
	}
}

func shouldExist(t *testing.T, neighbor *Hexagon, message string) {
	if neighbor == nil {
		t.Error("Expected", message, "to be exist, got nil")
	}
}

//     0_ 1  2_ 3  4_ 5  6_ 7  8_ 9
//  0 /  \__/  \__/  \__/  \__/c \__
//    \__/a \__/b \__/  \__/  \__/C \
//  1 /a \__/a \__/b \__/  \__/c \__/
//    \__/A \_b/B \__/b \__/  \__/c \
//  2 /a \__/a \__/B \__/  \__/  \__/
//    \__/a \_b/b \__/b \__/  \__/  \
//  3 /  \__/  \__/b \__/  \__/  \__/
//    \__/  \__/  \__/  \__/  \__/  \
//  4 /  \__/  \__/  \__/  \__/  \__/
//    \__/  \__/  \__/  \__/  \__/  \
//  5 /  \__/  \__/  \__/  \__/  \__/
//    \__/  \__/  \__/  \__/  \__/  \
//  6 /  \__/  \__/  \__/  \__/  \__/
//    \__/  \__/  \__/  \__/  \__/  \
//  7 /  \__/  \__/  \__/  \__/  \__/
//    \__/  \__/  \__/  \__/  \__/  \
//  8 /  \__/  \__/  \__/  \__/  \__/
//    \__/  \__/  \__/  \__/  \__/  \
//  9 /  \__/  \__/  \__/  \__/  \__/
//    \__/  \__/  \__/  \__/  \__/  \
//       \__/  \__/  \__/  \__/  \__/
//
func TestRegionRegionLessNeighborHexagons(t *testing.T) {

	model := makeHexagonModel()

	regionA, regionB, regionC := new(Region), new(Region), new(Region)

	regionA.AssignHexagon(model.Hexagon(1, 1))
	regionB.AssignHexagon(model.Hexagon(3, 1)).AssignHexagon(model.Hexagon(4, 2))
	regionC.AssignHexagon(model.Hexagon(9, 0))

	// regionA
	// =======================================================
	regionLess := regionA.RegionLessNeighborHexagons()
	testRegionLessCount(t, regionLess, 6, "regionA")

	testNotIncludeHexagonAt(t, regionLess, 1, 1)

	testIncludeHexagonAt(t, regionLess, 0, 1)
	testIncludeHexagonAt(t, regionLess, 1, 0)
	testIncludeHexagonAt(t, regionLess, 2, 1)
	testIncludeHexagonAt(t, regionLess, 2, 2)
	testIncludeHexagonAt(t, regionLess, 1, 2)
	testIncludeHexagonAt(t, regionLess, 0, 2)

	// regionB
	// =======================================================
	regionLess = regionB.RegionLessNeighborHexagons()
	testRegionLessCount(t, regionLess, 8, "regionB")

	testNotIncludeHexagonAt(t, regionLess, 3, 1)
	testNotIncludeHexagonAt(t, regionLess, 4, 2)

	testIncludeHexagonAt(t, regionLess, 3, 0)
	testIncludeHexagonAt(t, regionLess, 4, 1)
	testIncludeHexagonAt(t, regionLess, 5, 1)
	testIncludeHexagonAt(t, regionLess, 5, 2)
	testIncludeHexagonAt(t, regionLess, 4, 3)
	testIncludeHexagonAt(t, regionLess, 3, 2)
	testIncludeHexagonAt(t, regionLess, 2, 2)
	testIncludeHexagonAt(t, regionLess, 2, 1)

	// regionC
	// =======================================================
	regionLess = regionC.RegionLessNeighborHexagons()
	testRegionLessCount(t, regionLess, 3, "regionC")

	testNotIncludeHexagonAt(t, regionLess, 9, 0)

	testIncludeHexagonAt(t, regionLess, 8, 0)
	testIncludeHexagonAt(t, regionLess, 8, 1)
	testIncludeHexagonAt(t, regionLess, 9, 1)
}

func testRegionLessCount(t *testing.T, regionLess []*Hexagon, expectedLength int, regionName string) {
	if len(regionLess) != expectedLength {
		t.Error(regionName, "expected to have", expectedLength, "region-less-neighbor-hexagons, got", len(regionLess))
	}
}

func includeHexagonAt(hexagons []*Hexagon, col, row uint) bool {
	for _, hex := range hexagons {
		if hex.Row == row && hex.Col == col {
			return true
		}
	}
	return false
}

func testNotIncludeHexagonAt(t *testing.T, hexagons []*Hexagon, col, row uint) {
	if includeHexagonAt(hexagons, col, row) {
		for _, hex := range hexagons {
			fmt.Println(hex)
		}
		t.Error("Not expected to find Hexagon.Col=", col, ".Row=", row, " inside, got one")
	}
}

func testIncludeHexagonAt(t *testing.T, hexagons []*Hexagon, col, row uint) {
	if !includeHexagonAt(hexagons, col, row) {
		for _, hex := range hexagons {
			fmt.Println(hex)
		}
		t.Error("Expected to find Hexagon.Col=", col, ".Row=", row, ", got false")
	}
}

//     0_ 1  2_ 3  4_ 5  6_ 7  8_ 9
//  0 /  \__/  \__/  \__/  \__/  \__
//    \__/  \__/  \__/  \__/  \__/C \
//  1 /  \__/  \__/  \__/  \__/  \__/
//    \__/A \__/B \__/  \__/  \__/  \
//  2 /  \__/  \__/B \__/  \__/  \__/
//    \__/  \__/  \__/  \__/  \__/  \
//  3 /  \__/  \__/  \__/  \__/  \__/
//    \__/  \__/  \__/  \__/  \__/  \
//  4 /  \__/D \__/D \__/  \__/  \__/
//    \__/D \__/D \__/E \__/  \__/  \
//  5 /D \__/d \__/D \__/  \__/  \__/
//    \__/d \__/d \__/E \__/  \__/  \
//  6 /D \__/D \__/D \__/  \__/  \__/
//    \__/D \__/D \__/E \__/  \__/  \
//  7 /D \__/  \__/E \__/  \__/  \__/
//    \__/  \__/  \__/  \__/  \__/  \
//  8 /  \__/  \__/  \__/  \__/  \__/
//    \__/  \__/  \__/  \__/  \__/  \
//  9 /  \__/  \__/  \__/  \__/  \__/
//    \__/  \__/  \__/  \__/  \__/  \
//       \__/  \__/  \__/  \__/  \__/
//
func TestRegionShapeHexagons(t *testing.T) {

	model := makeHexagonModel()

	// regionA
	// =======================================================
	region := new(Region)
	region.AssignHexagon(model.Hexagon(1, 1))

	shape := region.ShapeHexagons()
	testShapeCount(t, shape, 1, "regionA")

	testIncludeHexagonAt(t, shape, 1, 1)

	// regionB
	// =======================================================
	region = new(Region)
	region.AssignHexagon(model.Hexagon(3, 1))
	region.AssignHexagon(model.Hexagon(4, 2))

	shape = region.ShapeHexagons()
	testShapeCount(t, shape, 2, "regionB")

	testIncludeHexagonAt(t, shape, 3, 1)
	testIncludeHexagonAt(t, shape, 4, 2)

	// regionC
	// =======================================================
	region = new(Region)
	region.AssignHexagon(model.Hexagon(9, 0))

	shape = region.ShapeHexagons()
	testShapeCount(t, shape, 1, "regionC")

	testIncludeHexagonAt(t, shape, 9, 0)

	// regionD
	// =======================================================
	region = new(Region)
	region.AssignHexagon(model.Hexagon(0, 5))
	region.AssignHexagon(model.Hexagon(1, 4))
	region.AssignHexagon(model.Hexagon(2, 4))
	region.AssignHexagon(model.Hexagon(0, 6))
	region.AssignHexagon(model.Hexagon(1, 5))
	region.AssignHexagon(model.Hexagon(2, 5))
	region.AssignHexagon(model.Hexagon(3, 4))
	region.AssignHexagon(model.Hexagon(4, 4))
	region.AssignHexagon(model.Hexagon(0, 7))
	region.AssignHexagon(model.Hexagon(1, 6))
	region.AssignHexagon(model.Hexagon(2, 6))
	region.AssignHexagon(model.Hexagon(3, 5))
	region.AssignHexagon(model.Hexagon(4, 5))
	region.AssignHexagon(model.Hexagon(3, 6))
	region.AssignHexagon(model.Hexagon(4, 6))

	shape = region.ShapeHexagons()
	testShapeCount(t, shape, 12, "regionD")

	testNotIncludeHexagonAt(t, shape, 1, 5)
	testNotIncludeHexagonAt(t, shape, 2, 5)
	testNotIncludeHexagonAt(t, shape, 3, 5)

	testIncludeHexagonAt(t, shape, 0, 5)
	testIncludeHexagonAt(t, shape, 1, 4)
	testIncludeHexagonAt(t, shape, 2, 4)
	testIncludeHexagonAt(t, shape, 0, 6)
	testIncludeHexagonAt(t, shape, 3, 4)
	testIncludeHexagonAt(t, shape, 4, 4)
	testIncludeHexagonAt(t, shape, 0, 7)
	testIncludeHexagonAt(t, shape, 1, 6)
	testIncludeHexagonAt(t, shape, 2, 6)
	testIncludeHexagonAt(t, shape, 4, 5)
	testIncludeHexagonAt(t, shape, 3, 6)
	testIncludeHexagonAt(t, shape, 4, 6)
}

func testShapeCount(t *testing.T, shape []*Hexagon, expectedLength int, regionName string) {
	if len(shape) != expectedLength {
		t.Error(regionName, "expected to have", expectedLength, "shape-hexagons, got", len(shape))
	}
}

//     0_ 1  2_ 3  4_ 5  6_ 7  8_ 9
//  0 /  \__/  \__/  \__/  \__/  \__
//    \__/  \__/  \__/  \__/  \__/C \
//  1 /  \__/  \__/  \__/  \__/  \__/
//    \__/A \__/B \__/  \__/  \__/  \
//  2 /  \__/  \_1/B \__/  \__/  \__/
//    \__/F \__/  \_2/  \__/  \__/  \
//  3 /F \_3/F \__/  \__/  \__/  \__/
//    \_4/F \_2/  \__/  \__/  \__/  \
//  4 /F \_1/D \__/D \__/  \__/  \__/
//    \_5/D \_2/D \12/E \__/  \__/  \
//  5 /D \_3/d \_1/D \_2/  \__/  \__/
//    \_4/d \__/d \11/E \__/  \__/  \
//  6 /D \__/D \__/D \_1/  \__/  \__/
//    \_5/D \_8/D \10/E \__/E \__/  \
//  7 /D \_7/  \_9/E \_3/E \_6/  \__/
//    \_6/  \__/  \_4/  \_5/  \__/  \
//  8 /  \__/  \__/  \__/  \__/  \__/
//    \__/  \__/  \__/  \__/  \__/  \
//  9 /  \__/  \__/  \__/  \__/  \__/
//    \__/  \__/  \__/  \__/  \__/  \
//       \__/  \__/  \__/  \__/  \__/
//
func TestNextHexagonShapeEdgeRegionA(t *testing.T) {

	model := makeHexagonModel()
	region := new(Region)

	region.AssignHexagon(model.Hexagon(1, 1))

	hexagon := model.Hexagon(1, 1)

	shape := NewRegionShape(region, nil)
	nextHexagon, nextEdge := shape.nextHexagonEdge(hexagon, -1)

	if nextHexagon != nil || nextEdge != -1 {
		t.Error("nextHexagon should be nil, is", nextHexagon)
	}

	if shape.visitedEdges[hexagon][0] == false {
		t.Error("hexagon->visitedEdges[0] should be true, is false")
	}
	if shape.visitedEdges[hexagon][1] == false {
		t.Error("hexagon->visitedEdges[1] should be true, is false")
	}
	if shape.visitedEdges[hexagon][2] == false {
		t.Error("hexagon->visitedEdges[2] should be true, is false")
	}
	if shape.visitedEdges[hexagon][3] == false {
		t.Error("hexagon->visitedEdges[3] should be true, is false")
	}
	if shape.visitedEdges[hexagon][4] == false {
		t.Error("hexagon->visitedEdges[4] should be true, is false")
	}
	if shape.visitedEdges[hexagon][5] == false {
		t.Error("hexagon->visitedEdges[5] should be true, is false")
	}

	if len(shape.shapePath) != 6 {
		t.Error("region.shapePath should have len==6, is", len(shape.shapePath))
	}
}

func assertNextHexagonEdge(t *testing.T, next *Hexagon, edge int, hexCoordX, hexCoordY uint, shouldEdge int, name string) {
	if next == nil {
		t.Error("Hexagon", name, "should not be nil, is nil")
	}
	if next.Col != hexCoordX {
		t.Error("Hexagon", name, ".Row should be ", hexCoordX, ", is", next.Col)
	}
	if next.Row != hexCoordY {
		t.Error("Hexagon", name, ".Col should be ", hexCoordY, ", is", next.Row)
	}
	if edge != shouldEdge {
		t.Error("Edge", name, " should be ", shouldEdge, ", is", edge)
	}
}

func TestNextHexagonShapeEdgeRegionB(t *testing.T) {

	model := makeHexagonModel()
	region := new(Region)

	region.AssignHexagon(model.Hexagon(3, 1))
	region.AssignHexagon(model.Hexagon(4, 2))

	hexagon := model.Hexagon(3, 1)

	shape := NewRegionShape(region, nil)

	nextHexagon, nextEdge := shape.nextHexagonEdge(hexagon, -1)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 4, 2, 3, "B1")

	nextHexagon, nextEdge = shape.nextHexagonEdge(nextHexagon, nextEdge)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 3, 1, 0, "B0")

	nextHexagon, nextEdge = shape.nextHexagonEdge(nextHexagon, nextEdge)
	if nextHexagon != nil {
		t.Error("nextHexagon should be nil, is", nextHexagon, "(after B0)")
	}
}

func TestNextHexagonShapeEdgeRegionD(t *testing.T) {

	model := makeHexagonModel()
	region := new(Region)

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

	hexagon := model.Hexagon(3, 4)

	shape := NewRegionShape(region, nil)

	nextHexagon, nextEdge := shape.nextHexagonEdge(hexagon, -1)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 2, 4, 0, "D1")
	nextHexagon, nextEdge = shape.nextHexagonEdge(nextHexagon, nextEdge)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 1, 4, 1, "D2")
	nextHexagon, nextEdge = shape.nextHexagonEdge(nextHexagon, nextEdge)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 0, 5, 1, "D3")
	nextHexagon, nextEdge = shape.nextHexagonEdge(nextHexagon, nextEdge)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 0, 6, 2, "D4")
	nextHexagon, nextEdge = shape.nextHexagonEdge(nextHexagon, nextEdge)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 0, 7, 2, "D5")
	nextHexagon, nextEdge = shape.nextHexagonEdge(nextHexagon, nextEdge)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 1, 6, 4, "D6")
	nextHexagon, nextEdge = shape.nextHexagonEdge(nextHexagon, nextEdge)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 2, 6, 4, "D7")
	nextHexagon, nextEdge = shape.nextHexagonEdge(nextHexagon, nextEdge)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 3, 6, 3, "D8")
	nextHexagon, nextEdge = shape.nextHexagonEdge(nextHexagon, nextEdge)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 4, 6, 4, "D9")
	nextHexagon, nextEdge = shape.nextHexagonEdge(nextHexagon, nextEdge)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 4, 5, 5, "D10")
	nextHexagon, nextEdge = shape.nextHexagonEdge(nextHexagon, nextEdge)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 4, 4, 5, "D11")
	nextHexagon, nextEdge = shape.nextHexagonEdge(nextHexagon, nextEdge)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 3, 4, 1, "D12")

	nextHexagon, nextEdge = shape.nextHexagonEdge(nextHexagon, nextEdge)
	if nextHexagon != nil {
		t.Error("nextHexagon should be nil, is", nextHexagon, "(after D12)")
	}

	_, exists := shape.visitedEdges[model.Hexagon(2, 5)]
	if exists {
		t.Error("Hexagon(2,5) should not be included in visitedEdges, but is")
	}
	_, exists = shape.visitedEdges[model.Hexagon(1, 5)]
	if exists {
		t.Error("Hexagon(1,5) should not be included in visitedEdges, but is")
	}
	_, exists = shape.visitedEdges[model.Hexagon(3, 5)]
	if exists {
		t.Error("Hexagon(3,5) should not be included in visitedEdges, but is")
	}
}

func TestNextHexagonShapeEdgeRegionE(t *testing.T) {

	model := makeHexagonModel()
	region := new(Region)

	region.AssignHexagon(model.Hexagon(5, 4))
	region.AssignHexagon(model.Hexagon(5, 5))
	region.AssignHexagon(model.Hexagon(5, 6))
	region.AssignHexagon(model.Hexagon(4, 7))
	region.AssignHexagon(model.Hexagon(6, 7))
	region.AssignHexagon(model.Hexagon(7, 6))

	hexagon := model.Hexagon(5, 5)

	shape := NewRegionShape(region, nil)

	nextHexagon, nextEdge := shape.nextHexagonEdge(hexagon, -1)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 5, 4, 5, "E1")
	nextHexagon, nextEdge = shape.nextHexagonEdge(nextHexagon, nextEdge)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 5, 5, 2, "E2")
	nextHexagon, nextEdge = shape.nextHexagonEdge(nextHexagon, nextEdge)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 5, 6, 2, "E1")
	nextHexagon, nextEdge = shape.nextHexagonEdge(nextHexagon, nextEdge)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 4, 7, 1, "E3")
	nextHexagon, nextEdge = shape.nextHexagonEdge(nextHexagon, nextEdge)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 5, 6, 4, "E4")
	nextHexagon, nextEdge = shape.nextHexagonEdge(nextHexagon, nextEdge)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 6, 7, 3, "E3")
	nextHexagon, nextEdge = shape.nextHexagonEdge(nextHexagon, nextEdge)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 7, 6, 4, "E5")
	nextHexagon, nextEdge = shape.nextHexagonEdge(nextHexagon, nextEdge)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 6, 7, 1, "E6")
	nextHexagon, nextEdge = shape.nextHexagonEdge(nextHexagon, nextEdge)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 5, 6, 0, "E5")
	nextHexagon, nextEdge = shape.nextHexagonEdge(nextHexagon, nextEdge)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 5, 5, 5, "E3")

	nextHexagon, nextEdge = shape.nextHexagonEdge(nextHexagon, nextEdge)
	if nextHexagon != nil {
		t.Error("nextHexagon should be nil, is", nextHexagon, "(after E3)")
	}
}

func TestNextHexagonShapeEdgeRegionF(t *testing.T) {

	model := makeHexagonModel()
	region := new(Region)

	region.AssignHexagon(model.Hexagon(0, 3))
	region.AssignHexagon(model.Hexagon(1, 2))
	region.AssignHexagon(model.Hexagon(2, 3))
	region.AssignHexagon(model.Hexagon(0, 4))
	region.AssignHexagon(model.Hexagon(1, 3))

	hexagon := model.Hexagon(1, 3)

	shape := NewRegionShape(region, nil)

	nextHexagon, nextEdge := shape.nextHexagonEdge(hexagon, -1)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 2, 3, 4, "F1")
	nextHexagon, nextEdge = shape.nextHexagonEdge(nextHexagon, nextEdge)
	assertNextHexagonEdge(t, nextHexagon, nextEdge, 1, 2, 0, "F2")
}
