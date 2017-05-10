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
)

const startAtAngle float64 = 90

// The Hexagon represents a hexagon.
type Hexagon struct {
	Row, Col    uint
	Left, Top   float64
	vertices    []Vec2
	CenterPoint Vec2

	Region *Region

	NeighborNorth     *Hexagon
	NeighborNorthEast *Hexagon
	NeighborSouthEast *Hexagon
	NeighborSouth     *Hexagon
	NeighborSouthWest *Hexagon
	NeighborNorthWest *Hexagon

	NeighborRight *Hexagon
	NeighborLeft  *Hexagon
}

// Neighbor returns the neighbor hexagon by index.
//
// 	  _1_
// 	2/   \0
// 	3\___/5
// 	   4
//
func (hex *Hexagon) Neighbor(index int) *Hexagon {
	if index < 0 || index > 5 {
		panic("Hexagon.Neighbor index is out of range")
	}
	switch index {
	case 0:
		return hex.NeighborNorthEast
	case 1:
		return hex.NeighborNorth
	case 2:
		return hex.NeighborNorthWest
	case 3:
		return hex.NeighborSouthWest
	case 4:
		return hex.NeighborSouth
	case 5:
		return hex.NeighborSouthEast
	}
	return nil
}

// NeighborsWithRegionCount returns the number of neighbor hexagons
// which are assigned to a region.
func (hex *Hexagon) NeighborsWithRegionCount() uint {
	var count uint
	if hex.NeighborNorthEast != nil && hex.NeighborNorthEast.Region != nil {
		count++
	}
	if hex.NeighborNorth != nil && hex.NeighborNorth.Region != nil {
		count++
	}
	if hex.NeighborNorthWest != nil && hex.NeighborNorthWest.Region != nil {
		count++
	}
	if hex.NeighborSouthEast != nil && hex.NeighborSouthEast.Region != nil {
		count++
	}
	if hex.NeighborSouth != nil && hex.NeighborSouth.Region != nil {
		count++
	}
	if hex.NeighborSouthWest != nil && hex.NeighborSouthWest.Region != nil {
		count++
	}
	return count
}

func (hex *Hexagon) makePoints(width, height uint) {
	hex.vertices = make([]Vec2, 6)

	mx, my := float64(width)/2, float64(height)/2
	lx, ly := mx-1, my-1

	for i := range hex.vertices {
		r := (float64(i)*(360/6) + startAtAngle) * (math.Pi / 180)
		hex.vertices[i] = Vec2{math.Floor(0.5 + (math.Sin(r)*lx + mx + hex.Left)), math.Floor(0.5 + (math.Cos(r)*ly + my + hex.Top))}
	}

	hex.CenterPoint = Vec2{mx + hex.Left, my + hex.Top}
}

// Vertex returns the Vec2 by index.
func (hex *Hexagon) Vertex(i int) *Vec2 {
	return &hex.vertices[i]
}

// NewHexagon creates a new Hexagon.
//
// Normally this is done by the HexagonGrid
// and you do not need to create hexagons by yourself.
func NewHexagon(col, row, width, height uint, left, top float64) (hex *Hexagon) {
	hex = new(Hexagon)
	hex.Col, hex.Row = col, row
	hex.Left, hex.Top = left, top
	hex.makePoints(width, height)
	return
}
