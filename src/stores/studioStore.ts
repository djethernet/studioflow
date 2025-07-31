import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { LibraryItem, StudioItem, Viewport } from '../types/StudioItem'

type StudioState = {
  // Library templates (read-only gear definitions)
  libraryItems: LibraryItem[]
  
  // Studio project data (gear instances)
  studioItems: StudioItem[]
  
  // UI state
  selectedStudioItemId: string | null
  selectedLibraryItem: LibraryItem | null
  searchQuery: string
  viewport: Viewport
  
  // Library actions
  setSelectedLibraryItem: (item: LibraryItem | null) => void
  setSearchQuery: (query: string) => void
  getFilteredLibraryItems: () => LibraryItem[]
  
  // Studio item actions
  addStudioItem: (libraryItem: LibraryItem, x: number, y: number, onCanvas?: boolean) => void
  updateStudioItemPosition: (id: string, x: number, y: number) => void
  selectStudioItem: (id: string | null) => void
  removeStudioItem: (id: string) => void
  toggleStudioItemOnCanvas: (id: string) => void
  
  // Canvas-specific helpers
  getCanvasItems: () => StudioItem[]
  getAllStudioItems: () => StudioItem[]
  
  // Viewport actions
  updateViewport: (viewport: Partial<Viewport>) => void
}

// Sample library data (templates)
const sampleLibraryItems: LibraryItem[] = [
  {
    id: 1,
    name: 'Studio Monitors',
    dimensions: { width: 0.3, height: 0.5 },
    connections: [
      { name: 'XLR Input', direction: 'input' },
      { name: 'TRS Input', direction: 'input' }
    ],
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
    category: 'Mixer',
    icon: '🎛️'
  }
]

export const useStudioStore = create<StudioState>((set, get) => ({
  // Initial state
  libraryItems: sampleLibraryItems,
  studioItems: [],
  selectedStudioItemId: null,
  selectedLibraryItem: null,
  searchQuery: '',
  viewport: {
    offsetX: 0,
    offsetY: 0,
    zoom: 50 // Default zoom: 50 pixels per meter
  },
  
  // Library actions
  setSelectedLibraryItem: (item) => set({ selectedLibraryItem: item }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  getFilteredLibraryItems: () => {
    const { libraryItems, searchQuery } = get()
    if (!searchQuery) return libraryItems
    
    return libraryItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  },
  
  // Studio item actions
  addStudioItem: (libraryItem, x, y, onCanvas = true) => set((state) => {
    const newStudioItem: StudioItem = {
      id: uuidv4(),
      libraryItemId: libraryItem.id,
      // Copy library data for quick access
      name: libraryItem.name,
      dimensions: libraryItem.dimensions,
      connections: libraryItem.connections,
      category: libraryItem.category,
      icon: libraryItem.icon,
      // Instance properties
      position: { x, y },
      rotation: 0,
      isOnCanvas: onCanvas,
      selected: false
    }
    
    return {
      studioItems: [...state.studioItems, newStudioItem]
    }
  }),
  
  updateStudioItemPosition: (id, x, y) => set((state) => ({
    studioItems: state.studioItems.map((item) => 
      item.id === id ? { ...item, position: { x, y } } : item
    )
  })),
  
  selectStudioItem: (id) => set((state) => ({
    selectedStudioItemId: id,
    studioItems: state.studioItems.map((item) => ({ 
      ...item, 
      selected: item.id === id 
    }))
  })),
  
  removeStudioItem: (id) => set((state) => ({
    studioItems: state.studioItems.filter((item) => item.id !== id),
    selectedStudioItemId: state.selectedStudioItemId === id ? null : state.selectedStudioItemId
  })),
  
  toggleStudioItemOnCanvas: (id) => set((state) => ({
    studioItems: state.studioItems.map((item) => 
      item.id === id ? { ...item, isOnCanvas: !item.isOnCanvas } : item
    )
  })),
  
  // Canvas-specific helpers
  getCanvasItems: () => {
    const { studioItems } = get()
    return studioItems.filter(item => item.isOnCanvas)
  },
  
  getAllStudioItems: () => {
    const { studioItems } = get()
    return studioItems
  },
  
  // Viewport actions
  updateViewport: (newViewport) => set((state) => ({
    viewport: { ...state.viewport, ...newViewport }
  }))
}))