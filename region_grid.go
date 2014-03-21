package kiwotigo

type RegionGrid struct {
	width, height uint
	regions       []*Region
}

func NewRegionGrid(width, height uint) *RegionGrid {
	grid := new(RegionGrid)
	grid.width = width
	grid.height = height
	grid.regions = make([]*Region, width*height)
	return grid
}

func (grid *RegionGrid) Width() uint {
	return grid.width
}

func (grid *RegionGrid) Height() uint {
	return grid.height
}

func (grid *RegionGrid) regionsIndex(x, y uint) uint {
	if !(x < grid.width && y < grid.height) {
		panic("RegionGrid.regionsIndex(x, y) out of range!")
	}
	return y*grid.width + x
}

func (grid *RegionGrid) Region(x, y uint) *Region {
	return grid.regions[grid.regionsIndex(x, y)]
}

func (grid *RegionGrid) hasRegion(x, y uint) bool {
	return nil != grid.regions[grid.regionsIndex(x, y)]
}

func (grid *RegionGrid) SetRegion(x, y uint, region *Region) *RegionGrid {
	grid.regions[grid.regionsIndex(x, y)] = region
	return grid
}
