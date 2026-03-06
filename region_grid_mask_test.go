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
	"math/rand"
	"testing"
)

func makeTestRand() *rand.Rand {
	return rand.New(rand.NewSource(42))
}

func TestRegionGridMaskNilMask(t *testing.T) {
	mask := NewRegionGridMask(makeTestRand(), 4, 4, 1, 0.6, nil)
	anyTrue := false
	for y := uint(0); y < 4; y++ {
		for x := uint(0); x < 4; x++ {
			if mask.ShouldCreateRegionAt(x, y) {
				anyTrue = true
			}
		}
	}
	if !anyTrue {
		t.Error("Expected some cells to be true with nil mask and probability 0.6")
	}
}

func TestRegionGridMaskAllZeros(t *testing.T) {
	customMask := make([]bool, 9)
	mask := NewRegionGridMask(makeTestRand(), 3, 3, 1, 0.6, customMask)
	for y := uint(0); y < 3; y++ {
		for x := uint(0); x < 3; x++ {
			if mask.ShouldCreateRegionAt(x, y) {
				t.Errorf("Expected all cells to be false with all-zeros mask, got true at (%d,%d)", x, y)
			}
		}
	}
}

func TestRegionGridMaskColumnBlocked(t *testing.T) {
	// 3×3 grid, block column 0 (indices 0, 3, 6), allow columns 1 and 2
	customMask := []bool{false, true, true, false, true, true, false, true, true}
	mask := NewRegionGridMask(makeTestRand(), 3, 3, 1, 1.0, customMask)
	for y := uint(0); y < 3; y++ {
		if mask.ShouldCreateRegionAt(0, y) {
			t.Errorf("Expected column 0 row %d to be false (blocked by mask)", y)
		}
	}
}

func TestRegionGridMaskAllOnes(t *testing.T) {
	customMask := make([]bool, 16)
	for i := range customMask {
		customMask[i] = true
	}
	// Should not panic, behave same as nil mask
	mask := NewRegionGridMask(makeTestRand(), 4, 4, 1, 0.6, customMask)
	_ = mask
}

func TestContinentCreationStrategyWithRegionMask(t *testing.T) {
	cfg := ContinentConfig{
		GridWidth:                 4,
		GridHeight:                4,
		GridOuterPaddingX:         10,
		GridOuterPaddingY:         10,
		GridInnerPaddingX:         2,
		GridInnerPaddingY:         2,
		GridHexWidth:              6,
		GridHexHeight:             6,
		HexWidth:                  5,
		HexHeight:                 5,
		HexPaddingX:               0,
		HexPaddingY:               0,
		MinimalGrowIterations:     2,
		FastGrowIterations:        2,
		MaxRegionSizeFactor:       3.0,
		ProbabilityCreateRegionAt: 1.0,
		DivisibilityBy:            2,
		// Block left half (columns 0-1), allow columns 2-3
		RegionMask: []int{0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1},
	}
	strategy := NewContinentCreationStrategy(cfg)
	continent := strategy.BuildContinent(func(float64) {})
	if len(continent.regions) == 0 {
		t.Error("Expected at least one region after BuildContinent with RegionMask")
	}
}
