import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { LibraryItem, StudioItem, Viewport, NodeConnection } from '../types/StudioItem'
import type { LogMessage, LogLevel } from '../components/LogPanel'

// Utility function to calculate cable length between two studio items
function calculateCableLength(fromItem: StudioItem, toItem: StudioItem): number {
  const dx = toItem.position.x - fromItem.position.x
  const dy = toItem.position.y - fromItem.position.y
  const straightLineDistance = Math.sqrt(dx * dx + dy * dy)
  
  // Add some extra length for practical cable routing (20% extra + 1m minimum for routing)
  // This accounts for the fact that cables don't run in straight lines
  const practicalLength = straightLineDistance * 1.2 + 1.0
  
  // Round to nearest 0.1m for practical cable lengths
  return Math.round(practicalLength * 10) / 10
}

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
  nodeConnections: NodeConnection[]
  
  // Log panel state
  logMessages: LogMessage[]
  
  // Library actions
  setSelectedLibraryItem: (item: LibraryItem | null) => void
  setSearchQuery: (query: string) => void
  getFilteredLibraryItems: () => LibraryItem[]
  
  // Studio item actions
  addStudioItem: (libraryItem: LibraryItem, x: number, y: number, onCanvas?: boolean) => string
  updateStudioItemPosition: (id: string, x: number, y: number) => void
  updateStudioItemRotation: (id: string, rotation: number) => void
  updateStudioItemName: (id: string, name: string) => void
  selectStudioItem: (id: string | null) => void
  removeStudioItem: (id: string) => void
  toggleStudioItemOnCanvas: (id: string) => void
  
  // Canvas-specific helpers
  getCanvasItems: () => StudioItem[]
  getAllStudioItems: () => StudioItem[]
  
  // Connections view actions
  getNodePosition: (itemId: string) => { x: number, y: number }
  ensureNodePosition: (itemId: string) => void
  updateNodePosition: (itemId: string, x: number, y: number) => void
  updateConnectionsViewport: (viewport: Partial<Viewport>) => void
  
  // Node connection actions
  addNodeConnection: (fromNodeId: string, fromConnectionId: string, toNodeId: string, toConnectionId: string) => boolean
  removeNodeConnection: (connectionId: string) => void
  getNodeConnections: () => NodeConnection[]
  validateConnection: (fromNodeId: string, fromConnectionId: string, toNodeId: string, toConnectionId: string) => { valid: boolean, reason?: string }
  recalculateAllCableLengths: () => void
  
  // Viewport actions
  updateViewport: (viewport: Partial<Viewport>) => void
  
  // Log panel actions
  addLogMessage: (level: LogLevel, message: string) => void
  clearLogMessage: (id: string) => void
  clearAllLogs: () => void
  
  // Rack mounting actions
  mountItemInRack: (itemId: string, rackId: string, rackPosition: number) => boolean
  unmountItemFromRack: (itemId: string) => void
  getRackMountedItems: (rackId: string) => StudioItem[]
  getAvailableRackPositions: (rackId: string, itemRackUnits: number) => number[]
  
  // Project save/load actions
  exportStudioData: () => unknown
  importStudioData: (data: unknown) => void
  resetStudioData: () => void
}

// Sample library data (templates)
const sampleLibraryItems: LibraryItem[] = [
  {
    id: 1,
    name: 'Genelec 1031A',
    productModel: 'Genelec 1031A',
    dimensions: { width: 0.19, height: 0.28 },
    connections: [
      { id: 'genelec-xlr-in', name: 'XLR Input', direction: 'input', physical: 'XLR', category: 'balanced', way: 'socket' },
      { id: 'genelec-trs-in', name: 'TRS Input', direction: 'input', physical: 'TRS', category: 'balanced', way: 'socket' }
    ],
    category: 'Speakers',
    icon: '/src/assets/library_images/genelec_1031a.jpg'
    // No rackUnits - this is not rack-mountable
  },
  {
    id: 2,
    name: 'MOTU 828',
    productModel: 'MOTU 828',
    dimensions: { width: 0.48, height: 0.22 },
    connections: [
      // Front panel mic/line/hi-Z inputs (2x XLR/TRS combo)
      { id: 'motu-mic1', name: 'Mic/Line/Hi-Z Input 1', direction: 'input', physical: 'XLR', category: 'balanced', way: 'socket' },
      { id: 'motu-mic2', name: 'Mic/Line/Hi-Z Input 2', direction: 'input', physical: 'XLR', category: 'balanced', way: 'socket' },
      // Rear panel line inputs (8x TRS)
      { id: 'motu-line3', name: 'Line Input 3', direction: 'input', physical: 'TRS', category: 'balanced', way: 'socket' },
      { id: 'motu-line4', name: 'Line Input 4', direction: 'input', physical: 'TRS', category: 'balanced', way: 'socket' },
      { id: 'motu-line5', name: 'Line Input 5', direction: 'input', physical: 'TRS', category: 'balanced', way: 'socket' },
      { id: 'motu-line6', name: 'Line Input 6', direction: 'input', physical: 'TRS', category: 'balanced', way: 'socket' },
      { id: 'motu-line7', name: 'Line Input 7', direction: 'input', physical: 'TRS', category: 'balanced', way: 'socket' },
      { id: 'motu-line8', name: 'Line Input 8', direction: 'input', physical: 'TRS', category: 'balanced', way: 'socket' },
      { id: 'motu-line9', name: 'Line Input 9', direction: 'input', physical: 'TRS', category: 'balanced', way: 'socket' },
      { id: 'motu-line10', name: 'Line Input 10', direction: 'input', physical: 'TRS', category: 'balanced', way: 'socket' },
      
      // Main analog outputs (2x XLR)
      { id: 'motu-main-l', name: 'Main Out L', direction: 'output', physical: 'XLR', category: 'balanced', way: 'port' },
      { id: 'motu-main-r', name: 'Main Out R', direction: 'output', physical: 'XLR', category: 'balanced', way: 'port' },
      // Line outputs (8x TRS)
      { id: 'motu-out3', name: 'Line Out 3', direction: 'output', physical: 'TRS', category: 'balanced', way: 'port' },
      { id: 'motu-out4', name: 'Line Out 4', direction: 'output', physical: 'TRS', category: 'balanced', way: 'port' },
      { id: 'motu-out5', name: 'Line Out 5', direction: 'output', physical: 'TRS', category: 'balanced', way: 'port' },
      { id: 'motu-out6', name: 'Line Out 6', direction: 'output', physical: 'TRS', category: 'balanced', way: 'port' },
      { id: 'motu-out7', name: 'Line Out 7', direction: 'output', physical: 'TRS', category: 'balanced', way: 'port' },
      { id: 'motu-out8', name: 'Line Out 8', direction: 'output', physical: 'TRS', category: 'balanced', way: 'port' },
      { id: 'motu-out9', name: 'Line Out 9', direction: 'output', physical: 'TRS', category: 'balanced', way: 'port' },
      { id: 'motu-out10', name: 'Line Out 10', direction: 'output', physical: 'TRS', category: 'balanced', way: 'port' },
      
      // Headphone outputs (2x front panel)
      { id: 'motu-hp1', name: 'Headphone Out 1', direction: 'output', physical: '1/4', category: 'unbalanced', way: 'socket' },
      { id: 'motu-hp2', name: 'Headphone Out 2', direction: 'output', physical: '1/4', category: 'unbalanced', way: 'socket' },
      
      // Digital I/O - ADAT (16 channels total via 2 optical banks)
      { id: 'motu-adat-in-a', name: 'ADAT Bank A In', direction: 'input', physical: 'Optical', category: 'digital', way: 'socket' },
      { id: 'motu-adat-in-b', name: 'ADAT Bank B In', direction: 'input', physical: 'Optical', category: 'digital', way: 'socket' },
      { id: 'motu-adat-out-a', name: 'ADAT Bank A Out', direction: 'output', physical: 'Optical', category: 'digital', way: 'port' },
      { id: 'motu-adat-out-b', name: 'ADAT Bank B Out', direction: 'output', physical: 'Optical', category: 'digital', way: 'port' },
      
      // S/PDIF digital (RCA)
      { id: 'motu-spdif-in', name: 'S/PDIF In', direction: 'input', physical: 'RCA', category: 'digital', way: 'socket' },
      { id: 'motu-spdif-out', name: 'S/PDIF Out', direction: 'output', physical: 'RCA', category: 'digital', way: 'port' },
      
      // MIDI I/O
      { id: 'motu-midi-in', name: 'MIDI In', direction: 'input', physical: 'MIDI', category: 'midi', way: 'socket' },
      { id: 'motu-midi-out', name: 'MIDI Out', direction: 'output', physical: 'MIDI', category: 'midi', way: 'port' },
      { id: 'motu-midi-thru', name: 'MIDI Thru', direction: 'output', physical: 'MIDI', category: 'midi', way: 'port' },
      
      // Word Clock I/O (BNC)
      { id: 'motu-wc-in', name: 'Word Clock In', direction: 'input', physical: 'BNC', category: 'digital', way: 'socket' },
      { id: 'motu-wc-out', name: 'Word Clock Out', direction: 'output', physical: 'BNC', category: 'digital', way: 'port' },
      { id: 'motu-wc-thru', name: 'Word Clock Thru', direction: 'output', physical: 'BNC', category: 'digital', way: 'port' },
      
      // Footswitch input
      { id: 'motu-footswitch', name: 'Footswitch In', direction: 'input', physical: '1/4', category: 'control', way: 'socket' }
    ],
    category: 'Interface',
    icon: '/src/assets/library_images/motu_828.jpg',
    rackUnits: 1  // 1U rack-mountable audio interface
  },
  {
    id: 3,
    name: 'Roland JP-8000',
    productModel: 'Roland JP-8000',
    dimensions: { width: 1.2, height: 0.4 },
    connections: [
      { id: 'jp8000-audio-l', name: 'Audio Out L', direction: 'output', physical: '1/4', category: 'unbalanced', way: 'port' },
      { id: 'jp8000-audio-r', name: 'Audio Out R', direction: 'output', physical: '1/4', category: 'unbalanced', way: 'port' },
      { id: 'jp8000-midi-in', name: 'MIDI In', direction: 'input', physical: 'MIDI', category: 'midi', way: 'socket' },
      { id: 'jp8000-midi-out', name: 'MIDI Out', direction: 'output', physical: 'MIDI', category: 'midi', way: 'port' }
    ],
    category: 'Synth',
    icon: '/src/assets/library_images/roland_jp8000.jpg'
    // No rackUnits - desktop synthesizer
  },
  {
    id: 4,
    name: 'Yamaha O2R',
    productModel: 'Yamaha O2R',
    dimensions: { width: 1.8, height: 0.8 },
    connections: [
      { id: 'o2r-ch1', name: 'Ch1 Input', direction: 'input', physical: 'XLR', category: 'balanced', way: 'socket' },
      { id: 'o2r-ch2', name: 'Ch2 Input', direction: 'input', physical: 'XLR', category: 'balanced', way: 'socket' },
      { id: 'o2r-ch3', name: 'Ch3 Input', direction: 'input', physical: 'XLR', category: 'balanced', way: 'socket' },
      { id: 'o2r-ch4', name: 'Ch4 Input', direction: 'input', physical: 'XLR', category: 'balanced', way: 'socket' },
      { id: 'o2r-main-l', name: 'Main Out L', direction: 'output', physical: 'XLR', category: 'balanced', way: 'port' },
      { id: 'o2r-main-r', name: 'Main Out R', direction: 'output', physical: 'XLR', category: 'balanced', way: 'port' }
    ],
    category: 'Mixer',
    icon: '/src/assets/library_images/yamaha_o2r.jpg'
    // No rackUnits - large format desk mixer
  },
  {
    id: 5,
    name: '19" Equipment Rack',
    productModel: 'Standard 19" Rack 12U',
    dimensions: { width: 0.6, height: 0.7 }, // Standard 19" rack dimensions in overhead view
    connections: [
      { id: 'rack-power-in', name: 'Power Input', direction: 'input', physical: 'XLR', category: 'digital', way: 'socket' }
    ],
    category: 'Rack',
    icon: '/src/assets/library_images/rack_12u.jpg',
    isRack: true,
    rackCapacity: 12  // 12U rack
  },
  {
    id: 6,
    name: 'Focusrite Scarlett 18i20',
    productModel: 'Focusrite Scarlett 18i20',
    dimensions: { width: 0.48, height: 0.25 }, // Overhead view dimensions
    connections: [
      { id: 'scarlett-mic1', name: 'Mic Input 1', direction: 'input', physical: 'XLR', category: 'balanced', way: 'socket' },
      { id: 'scarlett-mic2', name: 'Mic Input 2', direction: 'input', physical: 'XLR', category: 'balanced', way: 'socket' },
      { id: 'scarlett-out1', name: 'Line Out 1', direction: 'output', physical: 'TRS', category: 'balanced', way: 'port' },
      { id: 'scarlett-out2', name: 'Line Out 2', direction: 'output', physical: 'TRS', category: 'balanced', way: 'port' },
      { id: 'scarlett-hp1', name: 'Headphone Out 1', direction: 'output', physical: '1/4', category: 'unbalanced', way: 'socket' },
      { id: 'scarlett-hp2', name: 'Headphone Out 2', direction: 'output', physical: '1/4', category: 'unbalanced', way: 'socket' }
    ],
    category: 'Interface',
    icon: '/src/assets/library_images/focusrite_scarlett.jpg',
    rackUnits: 1
  },
  {
    id: 7,
    name: 'DBX 266xs Compressor',
    productModel: 'DBX 266xs',
    dimensions: { width: 0.48, height: 0.25 }, // Overhead view dimensions  
    connections: [
      { id: 'dbx-in1', name: 'Input 1', direction: 'input', physical: 'XLR', category: 'balanced', way: 'socket' },
      { id: 'dbx-in2', name: 'Input 2', direction: 'input', physical: 'XLR', category: 'balanced', way: 'socket' },
      { id: 'dbx-out1', name: 'Output 1', direction: 'output', physical: 'XLR', category: 'balanced', way: 'port' },
      { id: 'dbx-out2', name: 'Output 2', direction: 'output', physical: 'XLR', category: 'balanced', way: 'port' }
    ],
    category: 'Processor',
    icon: '/src/assets/library_images/dbx_266xs.jpg',
    rackUnits: 1
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
  nodeConnections: [],
  logMessages: [],
  
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
  addStudioItem: (libraryItem, x, y, onCanvas = true) => {
    const newId = uuidv4()
    const newStudioItem: StudioItem = {
      id: newId,
      libraryItemId: libraryItem.id,
      // Copy library data for quick access
      name: libraryItem.name,
      productModel: libraryItem.productModel,
      dimensions: libraryItem.dimensions,
      connections: libraryItem.connections,
      category: libraryItem.category,
      icon: libraryItem.icon,
      rackUnits: libraryItem.rackUnits,
      isRack: libraryItem.isRack,
      rackCapacity: libraryItem.rackCapacity,
      // Instance properties
      position: { x, y },
      rotation: 0,
      isOnCanvas: onCanvas,
      selected: false,
      // Initialize rack properties
      mountedItems: libraryItem.isRack ? [] : undefined
    }
    
    set((state) => ({
      studioItems: [...state.studioItems, newStudioItem]
    }))
    
    return newId
  },
  
  updateStudioItemPosition: (id, x, y) => {
    set((state) => ({
      studioItems: state.studioItems.map((item) => 
        item.id === id ? { ...item, position: { x, y } } : item
      )
    }))
    
    // Recalculate cable lengths after position update
    get().recalculateAllCableLengths()
  },

  updateStudioItemRotation: (id, rotation) => set((state) => ({
    studioItems: state.studioItems.map((item) => 
      item.id === id ? { ...item, rotation } : item
    )
  })),
  
  updateStudioItemName: (id, name) => set((state) => ({
    studioItems: state.studioItems.map((item) => 
      item.id === id ? { ...item, name } : item
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
    
    // Return a default position if not found - don't auto-generate here
    return { x: 0, y: 0 }
  },

  ensureNodePosition: (itemId) => {
    const { nodePositions } = get()
    
    // If position already exists, do nothing
    if (nodePositions.has(itemId)) {
      return
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
  })),
  
  // Log panel actions
  addLogMessage: (level, message) => set((state) => {
    const newLogMessage: LogMessage = {
      id: uuidv4(),
      level,
      message,
      timestamp: new Date()
    }
    
    // Keep only last 10 messages to prevent memory bloat
    const updatedMessages = [...state.logMessages, newLogMessage].slice(-10)
    
    return { logMessages: updatedMessages }
  }),
  
  clearLogMessage: (id) => set((state) => ({
    logMessages: state.logMessages.filter(msg => msg.id !== id)
  })),
  
  clearAllLogs: () => set({ logMessages: [] }),
  
  // Node connection actions
  validateConnection: (fromNodeId, fromConnectionId, toNodeId, toConnectionId) => {
    const { studioItems } = get()
    
    const fromNode = studioItems.find(item => item.id === fromNodeId)
    const toNode = studioItems.find(item => item.id === toNodeId)
    
    if (!fromNode || !toNode) {
      return { valid: false, reason: 'Node not found' }
    }
    
    const fromConnection = fromNode.connections.find(conn => conn.id === fromConnectionId)
    const toConnection = toNode.connections.find(conn => conn.id === toConnectionId)
    
    if (!fromConnection || !toConnection) {
      return { valid: false, reason: 'Connection not found' }
    }
    
    // Must connect output to input
    if (fromConnection.direction !== 'output' || toConnection.direction !== 'input') {
      return { valid: false, reason: 'Must connect output to input' }
    }
    
    // Same node connection not allowed
    if (fromNodeId === toNodeId) {
      return { valid: false, reason: 'Cannot connect to same device' }
    }
    
    // Check category compatibility
    const { category: fromCat } = fromConnection
    const { category: toCat } = toConnection
    
    // Exact category match is always valid
    if (fromCat === toCat) {
      return { valid: true }
    }
    
    // Special conversion cases
    if (fromCat === 'unbalanced' && toCat === 'balanced') {
      return { valid: true } // Unbalanced can convert to balanced
    }
    
    if (fromCat === 'balanced' && toCat === 'unbalanced') {
      return { valid: true } // Balanced can convert to unbalanced (with adapters)
    }
    
    return { valid: false, reason: `Cannot connect ${fromCat} to ${toCat}` }
  },
  
  addNodeConnection: (fromNodeId, fromConnectionId, toNodeId, toConnectionId) => {
    const validation = get().validateConnection(fromNodeId, fromConnectionId, toNodeId, toConnectionId)
    
    if (!validation.valid) {
      get().addLogMessage('error', `Connection failed: ${validation.reason}`)
      return false
    }
    
    // Check if connection already exists
    const existingConnection = get().nodeConnections.find(conn => 
      conn.toNodeId === toNodeId && conn.toConnectionId === toConnectionId
    )
    
    if (existingConnection) {
      get().addLogMessage('warning', 'Connection already exists to this input')
      return false
    }
    
    // Generate cable name and calculate length based on connected devices
    const { studioItems } = get()
    const fromNode = studioItems.find(item => item.id === fromNodeId)
    const toNode = studioItems.find(item => item.id === toNodeId)
    const fromConnection = fromNode?.connections.find(conn => conn.id === fromConnectionId)
    
    if (!fromNode || !toNode) {
      get().addLogMessage('error', 'Cannot find connected devices for cable length calculation')
      return false
    }
    
    const cableName = `${fromNode.name} → ${toNode.name} (${fromConnection?.physical})`
    const cableLength = calculateCableLength(fromNode, toNode)
    
    const newConnection: NodeConnection = {
      id: uuidv4(),
      name: cableName,
      fromNodeId,
      fromConnectionId,
      toNodeId,
      toConnectionId,
      length: cableLength
    }
    
    set((state) => ({
      nodeConnections: [...state.nodeConnections, newConnection]
    }))
    
    get().addLogMessage('success', 'Connection created successfully')
    return true
  },
  
  removeNodeConnection: (connectionId) => set((state) => ({
    nodeConnections: state.nodeConnections.filter(conn => conn.id !== connectionId)
  })),
  
  getNodeConnections: () => {
    const { nodeConnections } = get()
    return nodeConnections
  },
  
  // Rack mounting actions
  mountItemInRack: (itemId, rackId, rackPosition) => {
    const { studioItems } = get()
    
    const item = studioItems.find(i => i.id === itemId)
    const rack = studioItems.find(i => i.id === rackId)
    
    if (!item || !rack || !rack.isRack || !item.rackUnits) {
      get().addLogMessage('error', 'Cannot mount: invalid item or rack')
      return false
    }
    
    // Check if position is available
    const availablePositions = get().getAvailableRackPositions(rackId, item.rackUnits)
    if (!availablePositions.includes(rackPosition)) {
      get().addLogMessage('error', `Rack position ${rackPosition} not available`)
      return false
    }
    
    // Remove item from canvas and mount in rack
    set((state) => ({
      studioItems: state.studioItems.map((studioItem) => {
        if (studioItem.id === itemId) {
          return {
            ...studioItem,
            mountedInRack: rackId,
            rackPosition: rackPosition,
            isOnCanvas: false
          }
        }
        if (studioItem.id === rackId) {
          return {
            ...studioItem,
            mountedItems: [...(studioItem.mountedItems || []), itemId]
          }
        }
        return studioItem
      })
    }))
    
    get().addLogMessage('success', `${item.name} mounted in rack at ${rackPosition}U`)
    return true
  },
  
  unmountItemFromRack: (itemId) => {
    const { studioItems } = get()
    const item = studioItems.find(i => i.id === itemId)
    
    if (!item || !item.mountedInRack) {
      return
    }
    
    const rackId = item.mountedInRack
    
    set((state) => ({
      studioItems: state.studioItems.map((studioItem) => {
        if (studioItem.id === itemId) {
          return {
            ...studioItem,
            mountedInRack: undefined,
            rackPosition: undefined,
            isOnCanvas: true // Put back on canvas
          }
        }
        if (studioItem.id === rackId) {
          return {
            ...studioItem,
            mountedItems: (studioItem.mountedItems || []).filter(id => id !== itemId)
          }
        }
        return studioItem
      })
    }))
    
    get().addLogMessage('info', `${item.name} unmounted from rack`)
  },
  
  getRackMountedItems: (rackId) => {
    const { studioItems } = get()
    return studioItems.filter(item => item.mountedInRack === rackId)
  },
  
  getAvailableRackPositions: (rackId, itemRackUnits) => {
    const { studioItems } = get()
    
    const rack = studioItems.find(item => item.id === rackId)
    if (!rack || !rack.isRack || !rack.rackCapacity) {
      return []
    }
    
    const mountedItems = get().getRackMountedItems(rackId)
    const occupiedPositions = new Set<number>()
    
    // Mark all occupied positions
    mountedItems.forEach(item => {
      if (item.rackPosition && item.rackUnits) {
        for (let i = 0; i < item.rackUnits; i++) {
          occupiedPositions.add(item.rackPosition + i)
        }
      }
    })
    
    // Find available positions that can fit the item
    const availablePositions: number[] = []
    for (let pos = 1; pos <= rack.rackCapacity - itemRackUnits + 1; pos++) {
      let canFit = true
      for (let i = 0; i < itemRackUnits; i++) {
        if (occupiedPositions.has(pos + i)) {
          canFit = false
          break
        }
      }
      if (canFit) {
        availablePositions.push(pos)
      }
    }
    
    return availablePositions
  },
  
  // Recalculate all cable lengths when item positions change
  recalculateAllCableLengths: () => {
    const { nodeConnections, studioItems } = get()
    
    const updatedConnections = nodeConnections.map(connection => {
      const fromNode = studioItems.find(item => item.id === connection.fromNodeId)
      const toNode = studioItems.find(item => item.id === connection.toNodeId)
      
      if (fromNode && toNode) {
        const newLength = calculateCableLength(fromNode, toNode)
        return { ...connection, length: newLength }
      }
      
      return connection
    })
    
    set({ nodeConnections: updatedConnections })
  },
  
  // Project save/load actions
  exportStudioData: () => {
    const state = get()
    
    // Helper function to remove undefined values and flatten nested arrays
    const cleanForFirestore = (obj: unknown): unknown => {
      if (Array.isArray(obj)) {
        // Check if this is a nested array (array containing arrays)
        const hasNestedArrays = obj.some(item => Array.isArray(item))
        if (hasNestedArrays) {
          console.warn('Found nested array, flattening:', obj)
          // Flatten nested arrays
          const flattened = obj.flat()
          return flattened.map(cleanForFirestore).filter(item => item !== undefined)
        }
        return obj.map(cleanForFirestore).filter(item => item !== undefined)
      } else if (obj !== null && typeof obj === 'object') {
        const cleaned: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
          if (value !== undefined) {
            const cleanedValue = cleanForFirestore(value)
            // Additional check - don't include if it became an empty array after cleaning
            if (Array.isArray(cleanedValue) && cleanedValue.length === 0 && Array.isArray(value) && value.length > 0) {
              console.warn(`Array field '${key}' became empty after cleaning, skipping`)
              continue
            }
            cleaned[key] = cleanedValue
          }
        }
        return cleaned
      }
      return obj
    }
    
    const rawData = {
      studioItems: state.studioItems,
      nodeConnections: state.nodeConnections,
      viewport: state.viewport,
      connectionsViewport: state.connectionsViewport,
      nodePositions: Object.fromEntries(state.nodePositions), // Convert Map to object instead of array of arrays
      timestamp: new Date().toISOString()
    }
    
    // Clean the data to remove all undefined values and handle nested arrays
    return cleanForFirestore(rawData)
  },
  
  importStudioData: (data) => {
    if (!data || typeof data !== 'object' || data === null) {
      console.warn('Invalid studio data provided for import')
      return
    }
    
    const studioData = data as Record<string, unknown>
    
    set({
      studioItems: studioData.studioItems || [],
      nodeConnections: studioData.nodeConnections || [],
      viewport: studioData.viewport || { offsetX: 0, offsetY: 0, zoom: 50 },
      connectionsViewport: studioData.connectionsViewport || { offsetX: 200, offsetY: 150, zoom: 80 },
      nodePositions: studioData.nodePositions ? new Map(Object.entries(studioData.nodePositions as Record<string, { x: number, y: number }>)) : new Map(), // Convert object back to Map
      selectedStudioItemId: null, // Reset selection
      logMessages: [] // Clear logs on project load
    })
    
    console.log('Studio data imported successfully')
  },
  
  resetStudioData: () => {
    set({
      studioItems: [],
      nodeConnections: [],
      selectedStudioItemId: null,
      viewport: { offsetX: 0, offsetY: 0, zoom: 50 },
      connectionsViewport: { offsetX: 200, offsetY: 150, zoom: 80 },
      nodePositions: new Map(),
      logMessages: []
    })
    
    console.log('Studio data reset')
  }
}))