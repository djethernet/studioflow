import { create } from 'zustand'
import type { LibraryItem } from '../types/LibraryItem'
import { v4 as uuidv4 } from 'uuid'

export type CanvasItem = {
  id: string
  gearItem: LibraryItem
  x: number
  y: number
  rotation: number
  selected: boolean
}

type Viewport = {
  offsetX: number
  offsetY: number
  zoom: number
}

type DiagramState = {
  items: CanvasItem[]
  selectedItemId: string | null
  addGearItem: (gearItem: LibraryItem, x: number, y: number) => void
  updateItemPosition: (id: string, x: number, y: number) => void
  selectItem: (id: string | null) => void
  viewport: Viewport
  updateViewport: (viewport: Partial<Viewport>) => void
}

export const useDiagramStore = create<DiagramState>((set) => ({
  items: [],
  selectedItemId: null,
  addGearItem: (gearItem, x, y) => set((state) => {
    const newItem: CanvasItem = {
      id: uuidv4(),
      gearItem,
      x,
      y,
      rotation: 0,
      selected: false
    }
    return {
      items: [...state.items, newItem],
    }
  }),
  updateItemPosition: (id, x, y) => set((state) => ({
    items: state.items.map((item) => item.id === id ? { ...item, x, y } : item),
  })),
  selectItem: (id) => set((state) => ({
    selectedItemId: id,
    items: state.items.map((item) => ({ ...item, selected: item.id === id }))
  })),
  viewport: {
    offsetX: 0,
    offsetY: 0,
    zoom: 50 // Default zoom: 50 pixels per meter (5m = 250px)
  },
  updateViewport: (newViewport) => set((state) => ({
    viewport: { ...state.viewport, ...newViewport },
  })),
}))

