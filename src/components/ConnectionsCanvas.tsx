import { useRef, useCallback, useEffect, useState } from 'react'
import { useStudioStore } from '../stores/studioStore'
import type { StudioItem } from '../types/StudioItem'

export function ConnectionsCanvas() {
  const { 
    getAllStudioItems, 
    connectionsViewport,
    updateConnectionsViewport,
    getNodePosition,
    updateNodePosition,
    getNodeConnections,
    addNodeConnection,
    removeNodeConnection,
    addLogMessage
  } = useStudioStore()
  
  const items = getAllStudioItems()
  const connections = getNodeConnections()
  const svgRef = useRef<SVGSVGElement>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const draggedNode = useRef<string | null>(null)
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 600 })
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Connection dragging state
  const [dragConnection, setDragConnection] = useState<{
    fromNodeId: string
    fromConnectionId: string
    startPos: { x: number, y: number }
    currentPos: { x: number, y: number }
  } | null>(null)

  // Update container dimensions based on window size to avoid circular dependency
  useEffect(() => {
    const updateDimensions = () => {
      // Use window dimensions and reserve space for UI elements
      // ConnectionsCanvas only has the right panel (no left panel like Canvas)
      const availableWidth = window.innerWidth - 350 // Account for right equipment panel (350px)
      const availableHeight = window.innerHeight - 100 // Account for tab header and margins
      setContainerDimensions({ 
        width: Math.max(300, availableWidth), 
        height: Math.max(200, availableHeight) 
      })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    
    return () => {
      window.removeEventListener('resize', updateDimensions)
    }
  }, [])

  // Coordinate transformation utilities
  const getViewBox = useCallback(() => {
    const viewBoxWidth = containerDimensions.width / connectionsViewport.zoom
    const viewBoxHeight = containerDimensions.height / connectionsViewport.zoom
    const viewBoxX = -connectionsViewport.offsetX / connectionsViewport.zoom
    const viewBoxY = -connectionsViewport.offsetY / connectionsViewport.zoom
    return { x: viewBoxX, y: viewBoxY, width: viewBoxWidth, height: viewBoxHeight }
  }, [containerDimensions, connectionsViewport])

  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    
    const normalizedX = (screenX - rect.left) / rect.width
    const normalizedY = (screenY - rect.top) / rect.height
    
    const viewBox = getViewBox()
    const worldX = viewBox.x + (normalizedX * viewBox.width)
    const worldY = viewBox.y + (normalizedY * viewBox.height)
    
    return { x: worldX, y: worldY }
  }, [getViewBox])

  // Helper to get connection circle position
  const getConnectionPosition = useCallback((item: StudioItem, connectionId: string) => {
    const nodePos = getNodePosition(item.id)
    const nodeWidth = 3
    const connection = item.connections.find(conn => conn.id === connectionId)
    if (!connection) return { x: 0, y: 0 }
    
    const inputCount = item.connections.filter(conn => conn.direction === 'input').length
    const outputCount = item.connections.filter(conn => conn.direction === 'output').length
    const maxConnections = Math.max(inputCount, outputCount, 1)
    const nodeHeight = Math.max(2, 0.8 + (maxConnections * 0.25))
    
    const x = nodePos.x - nodeWidth / 2
    const y = nodePos.y - nodeHeight / 2
    
    if (connection.direction === 'input') {
      const inputConnections = item.connections.filter(conn => conn.direction === 'input')
      const index = inputConnections.findIndex(conn => conn.id === connectionId)
      return {
        x: x + 0.15,
        y: y + 0.6 + (index * 0.25)
      }
    } else {
      const outputConnections = item.connections.filter(conn => conn.direction === 'output')
      const index = outputConnections.findIndex(conn => conn.id === connectionId)
      return {
        x: x + nodeWidth - 0.15,
        y: y + 0.6 + (index * 0.25)
      }
    }
  }, [getNodePosition])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const worldPos = screenToWorld(e.clientX, e.clientY)

    // Check if clicking on a connection circle first
    for (const item of items) {
      for (const connection of item.connections) {
        const connPos = getConnectionPosition(item, connection.id)
        const distance = Math.sqrt(
          Math.pow(worldPos.x - connPos.x, 2) + Math.pow(worldPos.y - connPos.y, 2)
        )
        
        if (distance <= 0.12) { // Slightly larger hit area than circle radius (0.08 + margin)
          if (connection.direction === 'output') {
            // Start dragging a new connection from output
            setDragConnection({
              fromNodeId: item.id,
              fromConnectionId: connection.id,
              startPos: connPos,
              currentPos: worldPos
            })
            return
          } else {
            // Check if there's an existing connection to this input to delete
            const existingConnection = connections.find(conn => 
              conn.toNodeId === item.id && conn.toConnectionId === connection.id
            )
            if (existingConnection) {
              removeNodeConnection(existingConnection.id)
              addLogMessage('info', 'Connection removed')
            }
            return
          }
        }
      }
    }

    // Check if clicking on a node (using node dimensions for hit detection)
    const clickedNode = items.find(item => {
      const nodePos = getNodePosition(item.id)
      const nodeWidth = 3 // Node width in world units
      const inputCount = item.connections.filter(conn => conn.direction === 'input').length
      const outputCount = item.connections.filter(conn => conn.direction === 'output').length
      const maxConnections = Math.max(inputCount, outputCount, 1)
      const nodeHeight = Math.max(2, 0.8 + (maxConnections * 0.25))
      
      const nodeLeft = nodePos.x - nodeWidth / 2
      const nodeRight = nodePos.x + nodeWidth / 2
      const nodeTop = nodePos.y - nodeHeight / 2
      const nodeBottom = nodePos.y + nodeHeight / 2
      
      return worldPos.x >= nodeLeft && worldPos.x <= nodeRight && worldPos.y >= nodeTop && worldPos.y <= nodeBottom
    })

    if (clickedNode) {
      draggedNode.current = clickedNode.id
    }

    isDragging.current = true
    dragStart.current = { x: e.clientX, y: e.clientY }
  }, [items, getNodePosition, screenToWorld, getConnectionPosition, connections, removeNodeConnection, addLogMessage])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    
    // Update connection drag position
    if (dragConnection) {
      const worldPos = screenToWorld(e.clientX, e.clientY)
      setDragConnection(prev => prev ? { ...prev, currentPos: worldPos } : null)
      return
    }

    if (!isDragging.current) return

    const deltaX = e.clientX - dragStart.current.x
    const deltaY = e.clientY - dragStart.current.y

    if (draggedNode.current) {
      // Move node
      const worldDeltaX = deltaX / connectionsViewport.zoom
      const worldDeltaY = deltaY / connectionsViewport.zoom
      
      const currentPos = getNodePosition(draggedNode.current)
      updateNodePosition(draggedNode.current, currentPos.x + worldDeltaX, currentPos.y + worldDeltaY)
    } else {
      // Pan canvas
      updateConnectionsViewport({
        offsetX: connectionsViewport.offsetX + deltaX,
        offsetY: connectionsViewport.offsetY + deltaY
      })
    }

    dragStart.current = { x: e.clientX, y: e.clientY }
  }, [isDragging, draggedNode, connectionsViewport, getNodePosition, updateNodePosition, updateConnectionsViewport, dragConnection, screenToWorld])

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    
    // Handle connection completion
    if (dragConnection) {
      const worldPos = screenToWorld(e.clientX, e.clientY)
      
      // Check if we're dropping on an input connection
      for (const item of items) {
        for (const connection of item.connections) {
          if (connection.direction === 'input') {
            const connPos = getConnectionPosition(item, connection.id)
            const distance = Math.sqrt(
              Math.pow(worldPos.x - connPos.x, 2) + Math.pow(worldPos.y - connPos.y, 2)
            )
            
            if (distance <= 0.16) { // Drop zone (larger to match bigger circles)
              addNodeConnection(
                dragConnection.fromNodeId,
                dragConnection.fromConnectionId,
                item.id,
                connection.id
              )
              setDragConnection(null)
              isDragging.current = false
              draggedNode.current = null
              return
            }
          }
        }
      }
      
      // No valid drop target found
      setDragConnection(null)
      addLogMessage('info', 'Connection cancelled - drop on an input to connect')
    }

    isDragging.current = false
    draggedNode.current = null
  }, [dragConnection, screenToWorld, items, getConnectionPosition, addNodeConnection, addLogMessage])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault()
      
      const rect = svg.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
      const newZoom = Math.max(10, Math.min(200, connectionsViewport.zoom * zoomFactor))

      // Zoom towards mouse position
      const zoomRatio = newZoom / connectionsViewport.zoom
      const newOffsetX = mouseX - (mouseX - connectionsViewport.offsetX) * zoomRatio
      const newOffsetY = mouseY - (mouseY - connectionsViewport.offsetY) * zoomRatio

      updateConnectionsViewport({
        zoom: newZoom,
        offsetX: newOffsetX,
        offsetY: newOffsetY
      })
    }

    svg.addEventListener('wheel', handleWheelNative, { passive: false })
    
    return () => {
      svg.removeEventListener('wheel', handleWheelNative)
    }
  }, [connectionsViewport, updateConnectionsViewport])

  // Helper to create curved connection path
  const createCurvedPath = useCallback((startPos: { x: number, y: number }, endPos: { x: number, y: number }) => {
    const dx = endPos.x - startPos.x
    const controlOffset = Math.max(0.5, Math.abs(dx) * 0.3)
    
    const cp1x = startPos.x + controlOffset
    const cp1y = startPos.y
    const cp2x = endPos.x - controlOffset
    const cp2y = endPos.y
    
    return `M ${startPos.x} ${startPos.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endPos.x} ${endPos.y}`
  }, [])

  // Render existing connections
  const renderConnections = useCallback(() => {
    return connections.map(conn => {
      const fromItem = items.find(item => item.id === conn.fromNodeId)
      const toItem = items.find(item => item.id === conn.toNodeId)
      
      if (!fromItem || !toItem) return null
      
      const startPos = getConnectionPosition(fromItem, conn.fromConnectionId)
      const endPos = getConnectionPosition(toItem, conn.toConnectionId)
      const path = createCurvedPath(startPos, endPos)
      
      return (
        <g key={conn.id}>
          <path
            d={path}
            stroke="#228be6"
            strokeWidth={0.04}
            fill="none"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              removeNodeConnection(conn.id)
              addLogMessage('info', 'Connection removed')
            }}
          />
          {/* Connection indicator dots */}
          <circle cx={startPos.x} cy={startPos.y} r={0.04} fill="#228be6" />
          <circle cx={endPos.x} cy={endPos.y} r={0.04} fill="#228be6" />
        </g>
      )
    })
  }, [connections, items, getConnectionPosition, createCurvedPath, removeNodeConnection, addLogMessage])

  // Render drag connection
  const renderDragConnection = useCallback(() => {
    if (!dragConnection) return null
    
    const path = createCurvedPath(dragConnection.startPos, dragConnection.currentPos)
    
    return (
      <path
        d={path}
        stroke="#fa5252"
        strokeWidth={0.04}
        fill="none"
        strokeDasharray="0.1 0.05"
        opacity={0.7}
      />
    )
  }, [dragConnection, createCurvedPath])

  const renderNode = (item: StudioItem) => {
    const nodePos = getNodePosition(item.id)
    const nodeWidth = 3
    const inputCount = item.connections.filter(conn => conn.direction === 'input').length
    const outputCount = item.connections.filter(conn => conn.direction === 'output').length
    const maxConnections = Math.max(inputCount, outputCount, 1)
    const nodeHeight = Math.max(2, 0.8 + (maxConnections * 0.25))
    const x = nodePos.x - nodeWidth / 2
    const y = nodePos.y - nodeHeight / 2
    
    return (
      <g key={item.id}>
        {/* Node background */}
        <rect
          x={x}
          y={y}
          width={nodeWidth}
          height={nodeHeight}
          fill="#ffffff"
          stroke="#dee2e6"
          strokeWidth={0.02}
          rx={0.1}
          style={{ filter: 'drop-shadow(0.02px 0.02px 0.04px rgba(0,0,0,0.1))' }}
        />
        
        {/* Node header */}
        <rect
          x={x}
          y={y}
          width={nodeWidth}
          height={0.4}
          fill="#f8f9fa"
          stroke="#dee2e6"
          strokeWidth={0.02}
          rx={0.1}
        />
        
        {/* Node title */}
        <text
          x={nodePos.x}
          y={y + 0.2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={0.3}
          fill="#495057"
          fontWeight="600"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {item.name}
        </text>
        
        {/* Input connections */}
        {item.connections.filter(conn => conn.direction === 'input').map((connection, index) => {
          const inputY = y + 0.6 + (index * 0.25)
          return (
            <g key={`input-${index}`}>
              {/* Connection circle */}
              <circle
                cx={x + 0.15}
                cy={inputY}
                r={0.08}
                fill="#228be6"
                stroke="#1971c2"
                strokeWidth={0.02}
              />
              {/* Connection name */}
              <text
                x={x + 0.35}
                y={inputY}
                textAnchor="start"
                dominantBaseline="middle"
                fontSize={0.2}
                fill="#495057"
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {connection.name}
              </text>
            </g>
          )
        })}
        
        {/* Output connections */}
        {item.connections.filter(conn => conn.direction === 'output').map((connection, index) => {
          const outputY = y + 0.6 + (index * 0.25)
          return (
            <g key={`output-${index}`}>
              {/* Connection circle */}
              <circle
                cx={x + nodeWidth - 0.15}
                cy={outputY}
                r={0.08}
                fill="#fa5252"
                stroke="#e03131"
                strokeWidth={0.02}
              />
              {/* Connection name */}
              <text
                x={x + nodeWidth - 0.35}
                y={outputY}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={0.2}
                fill="#495057"
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {connection.name}
              </text>
            </g>
          )
        })}
      </g>
    )
  }

  const renderGrid = () => {
    const gridSize = 1 // 1 unit grid for connections view
    const viewBox = getViewBox()

    const startX = Math.floor(viewBox.x / gridSize) * gridSize
    const endX = Math.ceil((viewBox.x + viewBox.width) / gridSize) * gridSize
    const startY = Math.floor(viewBox.y / gridSize) * gridSize
    const endY = Math.ceil((viewBox.y + viewBox.height) / gridSize) * gridSize

    const lines = []
    
    for (let x = startX; x <= endX; x += gridSize) {
      lines.push(
        <line
          key={`v${x}`}
          x1={x}
          y1={viewBox.y}
          x2={x}
          y2={viewBox.y + viewBox.height}
          stroke="#f1f3f4"
          strokeWidth={0.01}
        />
      )
    }
    
    for (let y = startY; y <= endY; y += gridSize) {
      lines.push(
        <line
          key={`h${y}`}
          x1={viewBox.x}
          y1={y}
          x2={viewBox.x + viewBox.width}
          y2={y}
          stroke="#f1f3f4"
          strokeWidth={0.01}
        />
      )
    }

    return <g>{lines}</g>
  }

  const viewBox = getViewBox()

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: containerDimensions.width,
        height: containerDimensions.height,
        overflow: 'hidden', 
        cursor: isDragging.current ? 'grabbing' : 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none'
      }}
    >
      <svg
        ref={svgRef}
        width={containerDimensions.width}
        height={containerDimensions.height}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDragStart={(e) => e.preventDefault()}
      >
        {renderGrid()}
        {renderConnections()}
        {renderDragConnection()}
        {items.map(renderNode)}
      </svg>
    </div>
  )
}