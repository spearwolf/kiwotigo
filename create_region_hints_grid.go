/*
	Copyright (C) 2017 Wolfger Schramm <wolfger@spearwolf.de>

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
	"math/rand"
)

type CreateRegionHintsGrid struct {
	width, height uint
	hints         []bool
}

func NewCreateRegionHintsGrid(rand *rand.Rand, width, height, divisibilityBy uint, probabilityCreateRegionAt float64) *CreateRegionHintsGrid {
	grid := new(CreateRegionHintsGrid)
	grid.width = width
	grid.height = height
	grid.hints = make([]bool, width*height)
	grid.generateHints(rand, divisibilityBy, probabilityCreateRegionAt)
	return grid
}

func (grid *CreateRegionHintsGrid) generateHints(rand *rand.Rand, divisibilityBy uint, probabilityCreateRegionAt float64) {
	hints := make([]bool, 0, len(grid.hints))
	for i := len(grid.hints) - 1; i > 0; i-- {
		if rand.Float64() < probabilityCreateRegionAt {
			hints = append(hints, true)
		}
	}

	maxLen := uint(len(grid.hints))
	isForward := uint(len(hints))+divisibilityBy < maxLen
	for {
		i := uint(len(hints))
		if i%divisibilityBy == 0 {
			break
		}
		if isForward {
			if i < maxLen {
				hints = append(hints, true)
			} else {
				panic("Congratulations! you encountered the very unexpected should-create-region-hint-forward failure :-/")
			}
		} else {
			if i < 2 {
				hints = hints[:i-1]
			} else {
				panic("Congratulations! you encountered the very unexpected should-create-region-hint-zero failure :-/")
			}
		}
	}

	for i := uint(len(hints)); i < maxLen; i++ {
		hints = append(hints, false)
	}
	for i := len(hints) - 1; i > 0; i-- {
		j := rand.Intn(i + 1)
		hints[i], hints[j] = hints[j], hints[i]
	}
	grid.hints = hints
}

func (grid *CreateRegionHintsGrid) hintIndex(x, y uint) uint {
	if !(x < grid.width && y < grid.height) {
		panic("CreateRegionHintsGrid.hintIndex(x, y) out of range!")
	}
	return y*grid.width + x
}

func (grid *CreateRegionHintsGrid) ShouldCreateRegion(x, y uint) bool {
	return grid.hints[grid.hintIndex(x, y)]
}
