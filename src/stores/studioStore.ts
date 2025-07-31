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
  
  // Connections view state
  connectionsViewport: Viewport
  nodePositions: Map<string, { x: number, y: number }>
  
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
  
  // Connections view actions
  getNodePosition: (itemId: string) => { x: number, y: number }
  updateNodePosition: (itemId: string, x: number, y: number) => void
  updateConnectionsViewport: (viewport: Partial<Viewport>) => void
  
  // Viewport actions
  updateViewport: (viewport: Partial<Viewport>) => void
}

// Sample library data (templates)
const sampleLibraryItems: LibraryItem[] = [
  {
    id: 1,
    name: 'Genelec 1031A',
    dimensions: { width: 0.3, height: 0.5 },
    connections: [
      { name: 'XLR Input', direction: 'input' },
      { name: 'TRS Input', direction: 'input' }
    ],
    category: 'Speakers',
    icon: '/src/assets/library_images/genelec_1031a.jpg'
  },
  {
    id: 2,
    name: 'MOTU 828',
    dimensions: { width: 0.4, height: 0.2 },
    connections: [
      { name: 'Mic Input 1', direction: 'input' },
      { name: 'Mic Input 2', direction: 'input' },
      { name: 'Line Out L', direction: 'output' },
      { name: 'Line Out R', direction: 'output' },
      { name: 'Headphone Out', direction: 'output' }
    ],
    category: 'Interface',
    icon: '/src/assets/library_images/motu_828.jpg'
  },
  {
    id: 3,
    name: 'Roland JP-8000',
    dimensions: { width: 1.2, height: 0.4 },
    connections: [
      { name: 'Audio Out L', direction: 'output' },
      { name: 'Audio Out R', direction: 'output' },
      { name: 'MIDI In', direction: 'input' },
      { name: 'MIDI Out', direction: 'output' }
    ],
    category: 'Synth',
    icon: '/src/assets/library_images/roland_jp8000.jpg'
  },
  {
    id: 4,
    name: 'Yamaha O2R',
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
    icon: '/src/assets/library_images/yamaha_o2r.jpg'
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
  connectionsViewport: {
    offsetX: 200, // Center the view to show nodes at origin
    offsetY: 150,
    zoom: 80 // Default zoom for connections view
  },
  nodePositions: new Map(),
  
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
  
  // Connections view actions
  getNodePosition: (itemId) => {
    const { nodePositions } = get()
    
    // If position exists, return it
    if (nodePositions.has(itemId)) {
      return nodePositions.get(itemId)!
    }
    
    // Auto-generate grid position for new nodes
    const existingPositions = Array.from(nodePositions.values())
    const gridSize = 5 // Grid spacing in world units
    const cols = 4 // Number of columns before wrapping
    
    let row = 0
    let col = 0
    
    // Find the next available grid position
    while (existingPositions.some(pos => 
      Math.abs(pos.x - (col * gridSize)) < 0.1 && 
      Math.abs(pos.y - (row * gridSize)) < 0.1
    )) {
      col++
      if (col >= cols) {
        col = 0
        row++
      }
    }
    
    const newPosition = { x: col * gridSize, y: row * gridSize }
    
    // Store the new position
    set((state) => ({
      nodePositions: new Map(state.nodePositions).set(itemId, newPosition)
    }))
    
    return newPosition
  },
  
  updateNodePosition: (itemId, x, y) => set((state) => ({
    nodePositions: new Map(state.nodePositions).set(itemId, { x, y })
  })),
  
  updateConnectionsViewport: (newViewport) => set((state) => ({
    connectionsViewport: { ...state.connectionsViewport, ...newViewport }
  })),
  
  // Viewport actions
  updateViewport: (newViewport) => set((state) => ({
    viewport: { ...state.viewport, ...newViewport }
  }))
}))