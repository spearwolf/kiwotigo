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
	"math"
)

const startAtAngle float64 = 90

type Hexagon struct {
	Row, Col          uint
	Left, Top         float64
	coords            []Vertex
	CenterPoint       Vertex
	Region            *Region
	NeighborNorth     *Hexagon
	NeighborNorthEast *Hexagon
	NeighborSouthEast *Hexagon
	NeighborSouth     *Hexagon
	NeighborSouthWest *Hexagon
	NeighborNorthWest *Hexagon
}

// Return neighbor hexagon by index.
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

func (hex *Hexagon) MakeCoords(width, height uint) {
	hex.coords = make([]Vertex, 6)

	mx, my := float64(width)/2, float64(height)/2
	lx, ly := mx-1, my-1

	for i := range hex.coords {
		r := (float64(i)*(360/6) + startAtAngle) * (math.Pi / 180)
		hex.coords[i] = Vertex{math.Floor(0.5 + (math.Sin(r)*lx + mx + hex.Left)), math.Floor(0.5 + (math.Cos(r)*ly + my + hex.Top))}
	}

	hex.CenterPoint = Vertex{mx + hex.Left, my + hex.Top}
}

func (hex *Hexagon) VertexCoord(i int) *Vertex {
	return &hex.coords[i]
}

func NewHexagon(col, row, width, height uint, left, top float64) (hex *Hexagon) {
	hex = new(Hexagon)
	hex.Col, hex.Row = col, row
	hex.Left, hex.Top = left, top
	hex.MakeCoords(width, height)
	return
}
