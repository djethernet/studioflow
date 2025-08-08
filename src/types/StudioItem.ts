export interface Dimensions {
  width: number
  height: number
}

export interface Connection {
  id: string                           // Unique identifier for this connection
  name: string
  direction: 'input' | 'output'
  physical: 'XLR' | '1/4' | '1/8' | 'MIDI' | 'USB' | 'TRS' | 'RCA' | 'Optical' | 'BNC'  // Physical connector type
  category: 'unbalanced' | 'balanced' | 'digital' | 'midi' | 'control'           // Signal category
  way: 'plug' | 'socket'               // Port (male) or socket (female)
  group?: string
}

export interface Position {
  x: number
  y: number
}

// Library template - the gear definition from the library
export interface LibraryItem {
  id: string                  // Firestore document ID
  name: string
  productModel: string        // Manufacturer and model (e.g., "SSL Matrix 2")
  dimensions: Dimensions
  connections: Connection[]
  category?: string
  icon?: string
  rackUnits?: number          // Height in rack units (1U = 1.75"). 0 or undefined = not rack-mountable
  isRack?: boolean            // True if this item IS a rack that can hold other equipment
  rackCapacity?: number       // Number of rack units this rack can hold (only for isRack: true)
  
  // Firebase metadata
  isOfficial?: boolean        // True for global/official gear, false for user custom gear
  createdAt?: Date           // Creation timestamp
  updatedAt?: Date           // Last updated timestamp
  tags?: string[]            // Search/filter tags
}

// Studio item - an instance of gear in the studio project
export interface StudioItem {
  // Instance identification
  id: string                    // Unique instance ID (UUID)
  libraryItemId: string        // Reference to original library template (Firestore ID)
  
  // Library data (copied for quick access)
  name: string                 // User-editable name (e.g., "Mixer 1")
  productModel: string        // Manufacturer and model (e.g., "SSL Matrix 2")
  dimensions: Dimensions
  connections: Connection[]
  category?: string
  icon?: string
  rackUnits?: number          // Height in rack units (copied from library)
  isRack?: boolean            // True if this item IS a rack (copied from library)
  rackCapacity?: number       // Number of rack units this rack can hold (copied from library)
  
  // Instance-specific properties
  position: Position           // World coordinates on canvas
  rotation: number            // Rotation in degrees
  isOnCanvas: boolean         // Whether placed on canvas or just in project
  selected: boolean           // UI selection state
  
  // Rack mounting properties
  mountedInRack?: string      // ID of the rack this item is mounted in
  rackPosition?: number       // Starting rack unit position (1-based, from bottom)
  mountedItems?: string[]     // IDs of items mounted in this rack (only for isRack: true)
  
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
  fromWay: 'plug' | 'socket' // Cable end type - opposite of the node's connection way
  toNodeId: string
  toConnectionId: string
  toWay: 'plug' | 'socket' // Cable end type - opposite of the node's connection way
  length: number // Cable length in meters
}