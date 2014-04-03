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

type Position struct {
	X, Y uint
}

func (pos *Position) Row() uint {
	return pos.Y
}

func (pos *Position) SetRow(row uint) uint {
	pos.Y = row
	return pos.Y
}

func (pos *Position) Col() uint {
	return pos.X
}

func (pos *Position) SetCol(col uint) uint {
	pos.X = col
	return pos.X
}
