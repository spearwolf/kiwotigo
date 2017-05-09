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

type HexagonGrid struct {
	Width, Height             uint
	canvasWidth, canvasHeight uint
	hexagons                  []*Hexagon
}

func (grid *HexagonGrid) CanvasWidth() uint {
	return grid.canvasWidth
}

func (grid *HexagonGrid) CanvasHeight() uint {
	return grid.canvasHeight
}

func (grid *HexagonGrid) Hexagon(x, y uint) *Hexagon {
	if x < grid.Width && y < grid.Height {
		return grid.hexagons[y*grid.Width+x]
	}
	return nil
}

func (grid *HexagonGrid) setHexagon(x, y uint, hex *Hexagon) *Hexagon {
	if x < grid.Width && y < grid.Height {
		grid.hexagons[y*grid.Width+x] = hex
	} else {
		panic("HexagonGrid position is out of range!")
	}
	return hex
}

func NewHexagonGrid(width, height, hexWidth, hexHeight, paddingX, paddingY uint) (grid *HexagonGrid) {

	grid = new(HexagonGrid)
	grid.Width, grid.Height = width, height
	grid.hexagons = make([]*Hexagon, width*height)

	baseHex := NewHexagon(0, 0, hexWidth, hexHeight, 0, 0)
	stepX := baseHex.VertexCoord(5).X - baseHex.VertexCoord(3).X
	stepY := baseHex.VertexCoord(5).Y - baseHex.VertexCoord(1).Y
	stepY1 := baseHex.VertexCoord(0).Y - baseHex.VertexCoord(1).Y

	grid.canvasWidth = uint(float64(width-1)*stepX) + (width-1)*paddingX + hexWidth
	grid.canvasHeight = uint(float64(height-1)*stepY) + (height-1)*paddingY + hexHeight + uint(stepY1)

	var row, col uint
	for ; row < height; row++ {
		for col = 0; col < width; col++ {

			left := math.Floor(0.5 + (float64(col)*stepX + float64(col*paddingX)))
			top := float64(row)*stepY + float64(row*paddingY)
			if col%2 == 1 {
				top += stepY1
			}
			top = math.Floor(0.5 + top)

			if row == 0 && col == 0 {
				grid.hexagons[0] = baseHex
			} else {
				hex := NewHexagon(col, row, hexWidth, hexHeight, left, top)
				grid.setHexagon(col, row, hex)
			}
		}
	}

	grid.connectNeighbors()
	return
}

func (grid *HexagonGrid) connectNeighbors() {
	var row, col uint
	for ; row < grid.Height; row++ {
		for col = 0; col < grid.Width; col++ {

			_row := row + (col % 2)
			hex := grid.Hexagon(col, row)

			if col > 0 {
				if _row < grid.Height {
					hex.NeighborSouthWest = grid.Hexagon(col-1, _row)
				}
				if _row > 0 {
					hex.NeighborNorthWest = grid.Hexagon(col-1, _row-1)
				}

				neighborLeft := grid.Hexagon(col-1, row)
				hex.NeighborLeft = neighborLeft
				neighborLeft.NeighborRight = hex
			}

			if row > 0 {
				hex.NeighborNorth = grid.Hexagon(col, row-1)
			}
			if row < grid.Height-1 {
				hex.NeighborSouth = grid.Hexagon(col, row+1)
			}

			if col < grid.Width-1 {
				if _row > 0 {
					hex.NeighborNorthEast = grid.Hexagon(col+1, _row-1)
				}
				if _row < grid.Height {
					hex.NeighborSouthEast = grid.Hexagon(col+1, _row)
				}
			}
		}
	}
}
