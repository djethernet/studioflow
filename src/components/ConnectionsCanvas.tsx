import { useRef, useCallback, useEffect, useState } from 'react'
import { useStudioStore } from '../stores/studioStore'
import type { StudioItem } from '../types/StudioItem'

export function ConnectionsCanvas() {
  const { 
    getAllStudioItems, 
    connectionsViewport,
    updateConnectionsViewport,
    getNodePosition,
    updateNodePosition
  } = useStudioStore()
  
  const items = getAllStudioItems()
  const svgRef = useRef<SVGSVGElement>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const draggedNode = useRef<string | null>(null)
  const [svgDimensions, setSvgDimensions] = useState({ width: 800, height: 600 })

  // Update SVG dimensions when ref becomes available or window resizes
  useEffect(() => {
    const updateDimensions = () => {
      const rect = svgRef.current?.getBoundingClientRect()
      if (rect && rect.width > 0 && rect.height > 0) {
        setSvgDimensions({ width: rect.width, height: rect.height })
      }
    }

    // Initial update with delay to ensure DOM is ready
    const timeoutId = setTimeout(updateDimensions, 50)
    
    // Set up resize listener
    window.addEventListener('resize', updateDimensions)
    
    // Set up intersection observer to detect when component becomes visible
    let observer: IntersectionObserver | null = null
    if (svgRef.current) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(updateDimensions, 10)
          }
        })
      })
      observer.observe(svgRef.current)
    }
    
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', updateDimensions)
      if (observer) {
        observer.disconnect()
      }
    }
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    // Convert to normalized coordinates (0-1)
    const normalizedX = mouseX / rect.width
    const normalizedY = mouseY / rect.height
    
    // Convert to world coordinates using viewBox
    const viewBoxWidth = rect.width / connectionsViewport.zoom
    const viewBoxHeight = rect.height / connectionsViewport.zoom
    const viewBoxX = -connectionsViewport.offsetX / connectionsViewport.zoom
    const viewBoxY = -connectionsViewport.offsetY / connectionsViewport.zoom
    
    const x = viewBoxX + (normalizedX * viewBoxWidth)
    const y = viewBoxY + (normalizedY * viewBoxHeight)

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
      
      return x >= nodeLeft && x <= nodeRight && y >= nodeTop && y <= nodeBottom
    })

    if (clickedNode) {
      draggedNode.current = clickedNode.id
    }

    isDragging.current = true
    dragStart.current = { x: e.clientX, y: e.clientY }
  }, [items, connectionsViewport, getNodePosition])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
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
  }, [isDragging, draggedNode, connectionsViewport, getNodePosition, updateNodePosition, updateConnectionsViewport])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    draggedNode.current = null
  }, [])

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
          fontSize={0.15}
          fill="#495057"
          fontWeight="600"
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
                cx={x + 0.08}
                cy={inputY}
                r={0.04}
                fill="#228be6"
                stroke="#1971c2"
                strokeWidth={0.01}
              />
              {/* Connection name */}
              <text
                x={x + 0.18}
                y={inputY}
                textAnchor="start"
                dominantBaseline="middle"
                fontSize={0.1}
                fill="#495057"
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
                cx={x + nodeWidth - 0.08}
                cy={outputY}
                r={0.04}
                fill="#fa5252"
                stroke="#e03131"
                strokeWidth={0.01}
              />
              {/* Connection name */}
              <text
                x={x + nodeWidth - 0.18}
                y={outputY}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={0.1}
                fill="#495057"
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
    const viewBox = {
      left: -connectionsViewport.offsetX / connectionsViewport.zoom,
      top: -connectionsViewport.offsetY / connectionsViewport.zoom,
      width: svgDimensions.width / connectionsViewport.zoom,
      height: svgDimensions.height / connectionsViewport.zoom
    }

    const startX = Math.floor(viewBox.left / gridSize) * gridSize
    const endX = Math.ceil((viewBox.left + viewBox.width) / gridSize) * gridSize
    const startY = Math.floor(viewBox.top / gridSize) * gridSize
    const endY = Math.ceil((viewBox.top + viewBox.height) / gridSize) * gridSize

    const lines = []
    
    for (let x = startX; x <= endX; x += gridSize) {
      lines.push(
        <line
          key={`v${x}`}
          x1={x}
          y1={viewBox.top}
          x2={x}
          y2={viewBox.top + viewBox.height}
          stroke="#f1f3f4"
          strokeWidth={0.01}
        />
      )
    }
    
    for (let y = startY; y <= endY; y += gridSize) {
      lines.push(
        <line
          key={`h${y}`}
          x1={viewBox.left}
          y1={y}
          x2={viewBox.left + viewBox.width}
          y2={y}
          stroke="#f1f3f4"
          strokeWidth={0.01}
        />
      )
    }

    return <g>{lines}</g>
  }

  const viewBoxWidth = svgDimensions.width / connectionsViewport.zoom
  const viewBoxHeight = svgDimensions.height / connectionsViewport.zoom

  return (
    <div style={{ flex: 1, overflow: 'hidden', cursor: isDragging.current ? 'grabbing' : 'grab' }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`${-connectionsViewport.offsetX / connectionsViewport.zoom} ${-connectionsViewport.offsetY / connectionsViewport.zoom} ${viewBoxWidth} ${viewBoxHeight}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {renderGrid()}
        {items.map(renderNode)}
      </svg>
    </div>
  )
}