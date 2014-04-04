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

type ContinentConfig struct {
	GridWidth, GridHeight                uint
	GridOuterPaddingX, GridOuterPaddingY uint
	GridInnerPaddingX, GridInnerPaddingY uint
	GridHexWidth, GridHexHeight          uint
	HexWidth, HexHeight                  uint
	HexPaddingX, HexPaddingY             uint
	MinimalGrowIterations                uint
	FastGrowIterations                   uint
	MaxRegionSizeFactor                  float64
}
