import { create } from 'zustand'
import type { LibraryItem } from '../types/LibraryItem'

type LibraryState = {
  items: LibraryItem[]
  selectedItem: LibraryItem | null
  searchQuery: string
  setSelectedItem: (item: LibraryItem | null) => void
  setSearchQuery: (query: string) => void
  getFilteredItems: () => LibraryItem[]
}

const sampleGearItems: LibraryItem[] = [
  {
    id: 1,
    name: 'Studio Monitors',
    dimensions: { width: 0.3, height: 0.5 },
    connections: [
      { name: 'XLR Input', direction: 'input' },
      { name: 'TRS Input', direction: 'input' }
    ],
    position: { x: 0, y: 0 },
    rotation: 0,
    category: 'Speakers',
    icon: '🔊'
  },
  {
    id: 2,
    name: 'Audio Interface',
    dimensions: { width: 0.4, height: 0.2 },
    connections: [
      { name: 'Mic Input 1', direction: 'input' },
      { name: 'Mic Input 2', direction: 'input' },
      { name: 'Line Out L', direction: 'output' },
      { name: 'Line Out R', direction: 'output' },
      { name: 'Headphone Out', direction: 'output' }
    ],
    position: { x: 0, y: 0 },
    rotation: 0,
    category: 'Interface',
    icon: '🎚️'
  },
  {
    id: 3,
    name: 'Synthesizer',
    dimensions: { width: 1.2, height: 0.4 },
    connections: [
      { name: 'Audio Out L', direction: 'output' },
      { name: 'Audio Out R', direction: 'output' },
      { name: 'MIDI In', direction: 'input' },
      { name: 'MIDI Out', direction: 'output' }
    ],
    position: { x: 0, y: 0 },
    rotation: 0,
    category: 'Synth',
    icon: '🎹'
  },
  {
    id: 4,
    name: 'Mixing Console',
    dimensions: { width: 1.8, height: 0.8 },
    connections: [
      { name: 'Ch1 Input', direction: 'input' },
      { name: 'Ch2 Input', direction: 'input' },
      { name: 'Ch3 Input', direction: 'input' },
      { name: 'Ch4 Input', direction: 'input' },
      { name: 'Main Out L', direction: 'output' },
      { name: 'Main Out R', direction: 'output' }
    ],
    position: { x: 0, y: 0 },
    rotation: 0,
    category: 'Mixer',
    icon: '🎛️'
  }
]

export const useLibraryStore = create<LibraryState>((set, get) => ({
  items: sampleGearItems,
  selectedItem: null,
  searchQuery: '',
  
  setSelectedItem: (item) => set({ selectedItem: item }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  getFilteredItems: () => {
    const { items, searchQuery } = get()
    if (!searchQuery) return items
    
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }
}))