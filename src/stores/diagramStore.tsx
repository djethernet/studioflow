import { create } from 'zustand'

export type GearItem = {
  id: string
  type: string
  x: number
  y: number
}

type Viewport = {
  offsetX : number
  offsetY : number
  zoom : number
}

type DiagramState = {
  items: GearItem[]
  addItem: (item: GearItem) => void
  updateItemPosition: (id: string, x: number, y: number) => void
  viewport: Viewport
  updateViewport: (viewport: Viewport) => void
}

export const useDiagramStore = create<DiagramState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item],
  })),
  updateItemPosition: (id, x, y) => set((state) => ({
    items: state.items.map((item) => item.id === id ? { ...item, x, y } : item),
  })),
  viewport: {
    offsetX : 0,
    offsetY : 0,
    zoom: 1
  },
  updateViewport: (viewport) => set(() => ({
    viewport,
  })),
}))

