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

func NewRegionGridMask(rand *rand.Rand, width, height, divisibilityBy uint, probabilityCreateRegionAt float64, customMask []bool) *RegionGridMask {
	grid := new(RegionGridMask)
	grid.width = width
	grid.height = height
	grid.hints = make([]bool, width*height)
	grid.generateHints(rand, divisibilityBy, probabilityCreateRegionAt, customMask)
	return grid
}

func (grid *RegionGridMask) generateHints(rand *rand.Rand, divisibilityBy uint, probabilityCreateRegionAt float64, customMask []bool) {
	maxLen := uint(len(grid.hints))

	// Collect eligible indices (those not blocked by customMask)
	eligible := make([]int, 0, maxLen)
	for i := uint(0); i < maxLen; i++ {
		if customMask == nil || customMask[i] {
			eligible = append(eligible, int(i))
		}
	}
	numEligible := uint(len(eligible))

	// Probabilistically determine number of true (region seed) positions
	trueCount := uint(0)
	for i := uint(0); i < numEligible; i++ {
		if rand.Float64() < probabilityCreateRegionAt {
			trueCount++
		}
	}

	// Adjust trueCount to be divisible by divisibilityBy
	if divisibilityBy > 1 && trueCount > 0 {
		remainder := trueCount % divisibilityBy
		if remainder != 0 {
			toAdd := divisibilityBy - remainder
			if trueCount+toAdd <= numEligible {
				trueCount += toAdd
			} else {
				trueCount -= remainder
			}
		}
	}

	// Initialize all hints to false
	for i := range grid.hints {
		grid.hints[i] = false
	}

	// Shuffle eligible indices (Fisher-Yates) and set first trueCount to true
	for i := len(eligible) - 1; i > 0; i-- {
		j := rand.Intn(i + 1)
		eligible[i], eligible[j] = eligible[j], eligible[i]
	}
	for i := uint(0); i < trueCount; i++ {
		grid.hints[eligible[i]] = true
	}
}

func (grid *RegionGridMask) hintIndex(x, y uint) uint {
	return y*grid.width + x
}

func (grid *RegionGridMask) ShouldCreateRegionAt(x, y uint) bool {
	return grid.hints[grid.hintIndex(x, y)]
}
