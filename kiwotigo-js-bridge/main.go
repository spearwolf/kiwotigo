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
	"flag"

	kiwotigo ".."
)

func main() {

	println("hej kiwotigo-js-bridge!")

	var gridWidth uint
	var gridHeight uint
	var gridOuterPaddingX uint
	var gridOuterPaddingY uint
	var gridInnerPaddingX uint
	var gridInnerPaddingY uint
	var gridHexWidth uint
	var gridHexHeight uint
	var hexWidth uint
	var hexHeight uint
	var hexPaddingX uint
	var hexPaddingY uint
	var fastGrowIterations uint
	var minimalGrowIterations uint
	var maxRegionSizeFactor float64
	var probabilityCreateRegionAt float64
	var divisibilityBy uint
	var prettyPrint bool

	flag.UintVar(&gridWidth, "gridWidth", 10, "grid with, uint, defaults to 10")
	flag.UintVar(&gridHeight, "gridHeight", 10, "grid height, uint, defaults to 10")
	flag.UintVar(&gridOuterPaddingX, "gridOuterPaddingX", 25, "grid outer horizontal padding, uint, defaults to 25")
	flag.UintVar(&gridOuterPaddingY, "gridOuterPaddingY", 25, "grid outer vertical padding y, uint, defaults to 25")
	flag.UintVar(&gridInnerPaddingX, "gridInnerPaddingX", 6, "grid inner horizontal padding, uint, defaults to 6")
	flag.UintVar(&gridInnerPaddingY, "gridInnerPaddingY", 3, "grid inner vertical padding, uint, defaults to 3")
	flag.UintVar(&gridHexWidth, "gridHexWidth", 16, "grid hex width, uint, defaults to 16")
	flag.UintVar(&gridHexHeight, "gridHexHeight", 14, "grid hex height, uint, defaults to 14")
	flag.UintVar(&hexWidth, "hexWidth", 12, "hex width, uint, defaults to 12")
	flag.UintVar(&hexHeight, "hexHeight", 12, "hex height, uint, defaults to 12")
	flag.UintVar(&hexPaddingX, "hexPaddingX", 0, "hex horizontal padding, uint, defaults to 0")
	flag.UintVar(&hexPaddingY, "hexPaddingY", 0, "hex vertical padding, uint, defaults to 0")
	flag.UintVar(&fastGrowIterations, "fastGrowIterations", 8, "fast grow iterations, uint, defaults to 8")
	flag.UintVar(&minimalGrowIterations, "minimalGrowIterations", 120, "minimal grow iterations, uint, defaults to 120")
	flag.Float64Var(&maxRegionSizeFactor, "maxRegionSizeFactor", 3, "max region size factor, float, defaults to 3.0")
	flag.Float64Var(&probabilityCreateRegionAt, "probabilityCreateRegionAt", 0.6, "probability to create a region, float, defaults to 0.6")
	flag.UintVar(&divisibilityBy, "divisibilityBy", 1, "region count divisibility by number, uint, defaults to 1")
	flag.BoolVar(&prettyPrint, "prettyPrint", false, "pretty print json output, float, defaults to false")

	flag.Parse()

	config := kiwotigo.ContinentConfig{
		GridWidth:                 gridWidth,
		GridHeight:                gridHeight,
		GridOuterPaddingX:         gridOuterPaddingX,     //25,
		GridOuterPaddingY:         gridOuterPaddingY,     //25,
		GridInnerPaddingX:         gridInnerPaddingX,     //6,
		GridInnerPaddingY:         gridInnerPaddingY,     //3,
		GridHexWidth:              gridHexWidth,          //16,
		GridHexHeight:             gridHexHeight,         //14,
		HexWidth:                  hexWidth,              //12,  //24,
		HexHeight:                 hexHeight,             //12
		HexPaddingX:               hexPaddingX,           //0,   //5,  //3,
		HexPaddingY:               hexPaddingY,           //0,   //5,  //3,
		FastGrowIterations:        fastGrowIterations,    //8,   //10,
		MinimalGrowIterations:     minimalGrowIterations, //120, //48,
		MaxRegionSizeFactor:       maxRegionSizeFactor,   //3}
		DivisibilityBy:            divisibilityBy,        //1}
		ProbabilityCreateRegionAt: probabilityCreateRegionAt}

	strategy := kiwotigo.NewContinentCreationStrategy(config)
	continent := strategy.BuildContinent()
	result := kiwotigo.NewContinentDescription(continent, &config)

	if prettyPrint {
		println(result.PrettyJson())
	} else {
		println(result.Json())
	}

}
