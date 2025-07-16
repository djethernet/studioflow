import { create } from 'zustand'

export type GearItem = {
  id: string
  type: string
  x: number
  y: number
}

type DiagramState = {
  items: GearItem[]
  addItem: (item: GearItem) => void
  updateItemPosition: (id: string, x: number, y: number) => void
}

export const useDiagramStore = create<DiagramState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item],
  })),
  updateItemPosition: (id, x, y) => set((state) => ({
    items: state.items.map((i) => i.id === id ? { ...i, x, y } : i),
  })),
}))

