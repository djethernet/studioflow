import { create } from 'zustand'

export const useDiagramStore = create((set) => ({
  diagram: {
    items: [],
  },
  addItem: (item) => set((state) => ({
    diagram: {
      ...state.diagram,
      items: [...state.diagram.items, item],
    },
  })),
  removeItem: (id) => set((state) => ({
    diagram: {
      ...state.diagram,
      items: state.diagram.items.filter((i) => i.id !== id),
    },
  })),
  updateItem: (id, newProps) => set((state) => ({
    diagram: {
      ...state.diagram,
      items: state.diagram.items.map((i) =>
        i.id === id ? { ...i, ...newProps } : i
      ),
    },
  })),
}))
