export interface Dimensions {
  width: number
  height: number
}

export interface Connection {
  name: string
  direction: 'input' | 'output'
  group?: string
}

export interface Position {
  x: number
  y: number
}

export interface LibraryItem {
  id: number
  name: string
  dimensions: Dimensions
  connections: Connection[]
  position: Position
  rotation: number
  category?: string
  icon?: string
}