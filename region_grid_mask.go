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

type RegionGridMask struct {
	width, height uint
	hints         []bool
}

func NewRegionGridMask(rand *rand.Rand, width, height, divisibilityBy uint, probabilityCreateRegionAt float64) *RegionGridMask {
	grid := new(RegionGridMask)
	grid.width = width
	grid.height = height
	grid.hints = make([]bool, width*height)
	grid.generateHints(rand, divisibilityBy, probabilityCreateRegionAt)
	return grid
}

func (grid *RegionGridMask) generateHints(rand *rand.Rand, divisibilityBy uint, probabilityCreateRegionAt float64) {
	hints := make([]bool, 0)
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
			}
		} else {
			if i < 2 {
				hints = hints[:i-1]
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

func (grid *RegionGridMask) hintIndex(x, y uint) uint {
	return y*grid.width + x
}

func (grid *RegionGridMask) ShouldCreateRegionAt(x, y uint) bool {
	return grid.hints[grid.hintIndex(x, y)]
}
