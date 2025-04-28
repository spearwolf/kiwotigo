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

	kiwotigo "github.com/spearwolf/kiwotigo"
)

func createContinent(this js.Value, inputs []js.Value) interface{} {

	// https://pkg.go.dev/syscall/js?tab=doc#ValueOf
	// map[string]interface{} <> js~Object
	args := js.ValueOf(inputs[0])

	config := kiwotigo.ContinentConfig{
		GridWidth:                 uint(args.Get("gridWidth").Int()),
		GridHeight:                uint(args.Get("gridHeight").Int()),
		GridOuterPaddingX:         uint(args.Get("gridOuterPaddingX").Int()),
		GridOuterPaddingY:         uint(args.Get("gridOuterPaddingY").Int()),
		GridInnerPaddingX:         uint(args.Get("gridInnerPaddingX").Int()),
		GridInnerPaddingY:         uint(args.Get("gridInnerPaddingY").Int()),
		GridHexWidth:              uint(args.Get("gridHexWidth").Int()),
		GridHexHeight:             uint(args.Get("gridHexHeight").Int()),
		HexWidth:                  uint(args.Get("hexWidth").Int()),
		HexHeight:                 uint(args.Get("hexHeight").Int()),
		HexPaddingX:               uint(args.Get("hexPaddingX").Int()),
		HexPaddingY:               uint(args.Get("hexPaddingY").Int()),
		FastGrowIterations:        uint(args.Get("fastGrowIterations").Int()),
		MinimalGrowIterations:     uint(args.Get("minimalGrowIterations").Int()),
		MaxRegionSizeFactor:       args.Get("maxRegionSizeFactor").Float(),
		ProbabilityCreateRegionAt: args.Get("probabilityCreateRegionAt").Float(),
		DivisibilityBy:            uint(args.Get("divisibilityBy").Int())}

	progressCallback := inputs[len(inputs)-2]
	readyCallback := inputs[len(inputs)-1]

	strategy := kiwotigo.NewContinentCreationStrategy(config)
	continent := strategy.BuildContinent(func(progress float64) {
		progressCallback.Invoke(progress)
	})
	result := kiwotigo.NewContinentDescription(continent, &config)

	readyCallback.Invoke(result.Json())

	return js.Undefined()
}

func main() {
	c := make(chan uint)
	js.Global().Set("__kiwotiGo_createContinent", js.FuncOf(createContinent))
	<-c
}
