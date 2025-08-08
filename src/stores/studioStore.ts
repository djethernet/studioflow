import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { LibraryItem, StudioItem, Viewport, NodeConnection } from '../types/StudioItem'
import type { LogMessage, LogLevel } from '../components/LogPanel'
import type { GearFormData } from '../components/AddGearModal'
import { 
  loadCombinedGear, 
  addCustomGear, 
  updateCustomGear, 
  deleteCustomGear,
  updateGlobalGear,
  deleteGlobalGear,
  type GearQueryOptions
} from '../services/gearService'
import { auth } from '../config/firebase'

// Default zoom level for canvas (pixels per meter)
const DEFAULT_CANVAS_ZOOM = 200

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
  // Library templates (read-only gear definitions) - now loaded from Firebase
  libraryItems: LibraryItem[]
  libraryLoading: boolean
  libraryError: string | null
  libraryHasMore: boolean
  libraryLastDoc: unknown // QueryDocumentSnapshot - keeping as unknown to avoid Firebase imports in types
  
  // Studio project data (gear instances)
  studioItems: StudioItem[]
  
  // UI state
  selectedStudioItemId: string | null
  selectedLibraryItem: LibraryItem | null
  searchQuery: string
  categoryFilter: string
  viewport: Viewport
  
  // Connections view state
  connectionsViewport: Viewport
  nodePositions: Map<string, { x: number, y: number }>
  nodeConnections: NodeConnection[]
  
  // Log panel state
  logMessages: LogMessage[]
  
  // Library actions (Firebase-backed)
  setSelectedLibraryItem: (item: LibraryItem | null) => void
  setSearchQuery: (query: string) => void
  setCategoryFilter: (category: string) => void
  loadGear: (options?: GearQueryOptions) => Promise<void>
  loadMoreGear: () => Promise<void>
  refreshGear: () => Promise<void>
  addLibraryItem: (gearData: GearFormData) => Promise<void>
  updateLibraryItem: (gearId: string, gearData: Partial<GearFormData>) => Promise<void>
  deleteLibraryItem: (gearId: string) => Promise<void>
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
  resetViewport: () => void
  
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

// Store will be initialized with empty library items - gear is now loaded from Firebase

export const useStudioStore = create<StudioState>((set, get) => ({
  // Initial state
  libraryItems: [],
  libraryLoading: false,
  libraryError: null,
  libraryHasMore: true,
  libraryLastDoc: null,
  studioItems: [],
  selectedStudioItemId: null,
  selectedLibraryItem: null,
  searchQuery: '',
  categoryFilter: '',
  viewport: {
    offsetX: 0,
    offsetY: 0,
    zoom: DEFAULT_CANVAS_ZOOM
  },
  connectionsViewport: {
    offsetX: 200, // Center the view to show nodes at origin
    offsetY: 150,
    zoom: 80 // Default zoom for connections view
  },
  nodePositions: new Map(),
  nodeConnections: [],
  logMessages: [],
  
  // Library actions (Firebase-backed)
  setSelectedLibraryItem: (item) => set({ selectedLibraryItem: item }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setCategoryFilter: (category) => set({ categoryFilter: category }),

  loadGear: async (options = {}) => {
    try {
      set({ libraryLoading: true, libraryError: null })
      
      const { searchQuery, categoryFilter } = get()
      const queryOptions: GearQueryOptions = {
        ...options,
        searchQuery: searchQuery || options.searchQuery,
        category: categoryFilter || options.category
      }

      const result = await loadCombinedGear(queryOptions)
      
      set({
        libraryItems: result.items,
        libraryHasMore: result.hasMore,
        libraryLastDoc: result.lastDoc,
        libraryLoading: false
      })
    } catch (error) {
      console.error('Failed to load gear:', error)
      set({ 
        libraryLoading: false, 
        libraryError: error instanceof Error ? error.message : 'Failed to load gear'
      })
      get().addLogMessage('error', 'Failed to load gear library')
    }
  },

  loadMoreGear: async () => {
    const { libraryHasMore, libraryLastDoc, libraryLoading, searchQuery, categoryFilter } = get()
    
    if (!libraryHasMore || libraryLoading) return

    try {
      set({ libraryLoading: true })
      
      const result = await loadCombinedGear({
        searchQuery,
        category: categoryFilter,
        lastDoc: libraryLastDoc as any
      })
      
      set((state) => ({
        libraryItems: [...state.libraryItems, ...result.items],
        libraryHasMore: result.hasMore,
        libraryLastDoc: result.lastDoc,
        libraryLoading: false
      }))
    } catch (error) {
      console.error('Failed to load more gear:', error)
      set({ 
        libraryLoading: false, 
        libraryError: error instanceof Error ? error.message : 'Failed to load more gear'
      })
    }
  },

  refreshGear: async () => {
    set({ 
      libraryItems: [], 
      libraryLastDoc: null, 
      libraryHasMore: true 
    })
    await get().loadGear()
  },

  addLibraryItem: async (gearData: GearFormData) => {
    try {
      set({ libraryLoading: true })
      
      // Check if user is admin via Firebase custom claims
      const user = auth.currentUser
      let isAdmin = false
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult()
          isAdmin = !!idTokenResult.claims.admin
        } catch (error) {
          console.error('Error checking admin status:', error)
        }
      }
      
      // Add to global collection if admin, user collection otherwise
      await addCustomGear(gearData, isAdmin)
      
      // Refresh the gear library to include the new item
      await get().refreshGear()
      
      const targetCollection = isAdmin ? 'global library' : 'library'
      get().addLogMessage('success', `Custom gear "${gearData.name}" added to ${targetCollection}`)
    } catch (error) {
      console.error('Failed to add gear:', error)
      set({ libraryLoading: false })
      get().addLogMessage('error', 'Failed to add gear')
      throw error
    }
  },

  updateLibraryItem: async (gearId: string, gearData: Partial<GearFormData>) => {
    try {
      // Find the item to determine if it's global or custom
      const item = get().libraryItems.find(item => item.id === gearId)
      const isGlobalItem = item?.isOfficial
      
      // Check if user is admin for global items
      const user = auth.currentUser
      let isAdmin = false
      if (user && isGlobalItem) {
        try {
          const idTokenResult = await user.getIdTokenResult()
          isAdmin = !!idTokenResult.claims.admin
        } catch (error) {
          console.error('Error checking admin status:', error)
        }
      }
      
      // Use appropriate update function
      if (isGlobalItem && isAdmin) {
        await updateGlobalGear(gearId, gearData)
      } else if (!isGlobalItem) {
        await updateCustomGear(gearId, gearData)
      } else {
        throw new Error('Not authorized to update this gear')
      }
      
      // Update the item in local state
      set((state) => ({
        libraryItems: state.libraryItems.map(item => 
          item.id === gearId ? { 
            ...item, 
            ...gearData,
            dimensions: gearData.width && gearData.height ? 
              { width: gearData.width, height: gearData.height } : item.dimensions,
            updatedAt: new Date()
          } : item
        )
      }))
      
      const itemType = isGlobalItem ? 'global' : 'custom'
      get().addLogMessage('success', `${itemType} gear updated successfully`)
    } catch (error) {
      console.error('Failed to update gear:', error)
      get().addLogMessage('error', 'Failed to update gear')
      throw error
    }
  },

  deleteLibraryItem: async (gearId: string) => {
    try {
      // Find the item to determine if it's global or custom
      const item = get().libraryItems.find(item => item.id === gearId)
      const isGlobalItem = item?.isOfficial
      
      // Check if user is admin for global items
      const user = auth.currentUser
      let isAdmin = false
      if (user && isGlobalItem) {
        try {
          const idTokenResult = await user.getIdTokenResult()
          isAdmin = !!idTokenResult.claims.admin
        } catch (error) {
          console.error('Error checking admin status:', error)
        }
      }
      
      // Use appropriate delete function
      if (isGlobalItem && isAdmin) {
        await deleteGlobalGear(gearId)
      } else if (!isGlobalItem) {
        await deleteCustomGear(gearId)
      } else {
        throw new Error('Not authorized to delete this gear')
      }
      
      // Remove from local state
      set((state) => ({
        libraryItems: state.libraryItems.filter(item => item.id !== gearId)
      }))
      
      const itemType = isGlobalItem ? 'global' : 'custom'
      get().addLogMessage('success', `${itemType} gear deleted`)
    } catch (error) {
      console.error('Failed to delete gear:', error)
      get().addLogMessage('error', 'Failed to delete gear')
      throw error
    }
  },
  
  getFilteredLibraryItems: () => {
    const { libraryItems, searchQuery, categoryFilter } = get()
    
    let filtered = libraryItems
    
    if (categoryFilter) {
      filtered = filtered.filter(item => item.category === categoryFilter)
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.productModel.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }
    
    return filtered
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

  // Reset viewport to default values
  resetViewport: () => set({
    viewport: { offsetX: 0, offsetY: 0, zoom: DEFAULT_CANVAS_ZOOM }
  }),
  
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
    
    if (!fromNode || !toNode) {
      get().addLogMessage('error', 'Cannot find connected devices for cable length calculation')
      return false
    }
    
    // Get the connection objects to determine cable end types
    const fromConnection = fromNode.connections.find(conn => conn.id === fromConnectionId)
    const toConnection = toNode.connections.find(conn => conn.id === toConnectionId)
    
    if (!fromConnection || !toConnection) {
      get().addLogMessage('error', 'Cannot find connection details')
      return false
    }
    
    // Cable end is opposite of the device connection way
    // If device has port (male), cable end is socket (female) and vice versa
    const fromWay = fromConnection.way === 'plug' ? 'socket' : 'plug'
    const toWay = toConnection.way === 'plug' ? 'socket' : 'plug'
    
    const cableName = `${fromNode.name} → ${toNode.name}`
    const cableLength = calculateCableLength(fromNode, toNode)
    
    const newConnection: NodeConnection = {
      id: uuidv4(),
      name: cableName,
      fromNodeId,
      fromConnectionId,
      fromWay,
      toNodeId,
      toConnectionId,
      toWay,
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
      studioItems: (studioData.studioItems as StudioItem[]) || [],
      nodeConnections: (studioData.nodeConnections as NodeConnection[]) || [],
      viewport: (studioData.viewport as Viewport) || { offsetX: 0, offsetY: 0, zoom: DEFAULT_CANVAS_ZOOM },
      connectionsViewport: (studioData.connectionsViewport as Viewport) || { offsetX: 200, offsetY: 150, zoom: 80 },
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
      viewport: { offsetX: 0, offsetY: 0, zoom: DEFAULT_CANVAS_ZOOM },
      connectionsViewport: { offsetX: 200, offsetY: 150, zoom: 80 },
      nodePositions: new Map(),
      logMessages: []
    })
  }
}))