/*
	Copyright (C) 2014-2020 Wolfger Schramm <wolfger@spearwolf.de>

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
package main

import (
	"syscall/js"

	kiwotigo ".."
)

func createContinent(this js.Value, inputs []js.Value) interface{} {

	// var gridHeight uint
	// var gridOuterPaddingX uint
	// var gridOuterPaddingY uint
	// var gridInnerPaddingX uint
	// var gridInnerPaddingY uint
	// var gridHexWidth uint
	// var gridHexHeight uint
	// var hexWidth uint
	// var hexHeight uint
	// var hexPaddingX uint
	// var hexPaddingY uint
	// var fastGrowIterations uint
	// var minimalGrowIterations uint
	// var maxRegionSizeFactor float64
	// var probabilityCreateRegionAt float64
	// var divisibilityBy uint
	// var prettyPrint bool

	config := kiwotigo.ContinentConfig{
		GridWidth:                 10,
		GridHeight:                10,
		GridOuterPaddingX:         25,
		GridOuterPaddingY:         25,
		GridInnerPaddingX:         6,
		GridInnerPaddingY:         3,
		GridHexWidth:              16,
		GridHexHeight:             14,
		HexWidth:                  12, //24,
		HexHeight:                 12,
		HexPaddingX:               0,   //5,  //3,
		HexPaddingY:               0,   //5,  //3,
		FastGrowIterations:        8,   //10,
		MinimalGrowIterations:     120, //48,
		MaxRegionSizeFactor:       3,
		DivisibilityBy:            1,
		ProbabilityCreateRegionAt: 0.6}

	strategy := kiwotigo.NewContinentCreationStrategy(config)
	continent := strategy.BuildContinent()
	result := kiwotigo.NewContinentDescription(continent, &config)

	json := result.Json()

	callback := inputs[len(inputs)-1]
	callback.Invoke(json)

	return 0
}

func main() {
	c := make(chan uint)
	js.Global().Set("__kiwotiGo_createContinent", js.FuncOf(createContinent))
	<-c
}
