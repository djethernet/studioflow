export interface Dimensions {
  width: number
  height: number
}

export interface Connection {
  id: string                           // Unique identifier for this connection
  name: string
  direction: 'input' | 'output'
  physical: 'XLR' | '1/4' | '1/8' | 'MIDI' | 'USB' | 'TRS' | 'RCA'  // Physical connector type
  category: 'unbalanced' | 'balanced' | 'digital' | 'midi'           // Signal category
  way: 'port' | 'socket'               // Port (male) or socket (female)
  group?: string
}

export interface Position {
  x: number
  y: number
}

// Library template - the gear definition from the library
export interface LibraryItem {
  id: number
  name: string
  productModel: string        // Manufacturer and model (e.g., "SSL Matrix 2")
  dimensions: Dimensions
  connections: Connection[]
  category?: string
  icon?: string
}

// Studio item - an instance of gear in the studio project
export interface StudioItem {
  // Instance identification
  id: string                    // Unique instance ID (UUID)
  libraryItemId: number        // Reference to original library template
  
  // Library data (copied for quick access)
  name: string                 // User-editable name (e.g., "Mixer 1")
  productModel: string        // Manufacturer and model (e.g., "SSL Matrix 2")
  dimensions: Dimensions
  connections: Connection[]
  category?: string
  icon?: string
  
  // Instance-specific properties
  position: Position           // World coordinates on canvas
  rotation: number            // Rotation in degrees
  isOnCanvas: boolean         // Whether placed on canvas or just in project
  selected: boolean           // UI selection state
  
  // Future extensibility
  // tags?: string[]          // User-defined tags
  // notes?: string           // User notes
  // customProperties?: Record<string, any>
}

// Viewport state for canvas view
export interface Viewport {
  offsetX: number
  offsetY: number
  zoom: number
}

// Connection between two nodes in the connections view
export interface NodeConnection {
  id: string
  name: string
  fromNodeId: string
  fromConnectionId: string
  toNodeId: string
  toConnectionId: string
}