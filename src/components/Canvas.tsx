import { useRef, useCallback, useEffect, useState } from 'react'
import { useStudioStore } from '../stores/studioStore'
import type { StudioItem } from '../types/StudioItem'
import { RotationHandle } from './RotationHandle'

export function Canvas() {
  const { 
    getCanvasItems, 
    viewport, 
    updateViewport, 
    selectStudioItem, 
    updateStudioItemPosition, 
    updateStudioItemRotation,
    addStudioItem,
    addLogMessage 
  } = useStudioStore()
  const items = getCanvasItems()
  const svgRef = useRef<SVGSVGElement>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const draggedItem = useRef<string | null>(null)
  const isRotating = useRef(false)
  const rotatingItem = useRef<string | null>(null)
  const [containerDimensions, setContainerDimensions] = useState({ width: 800, height: 600 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Update container dimensions based on window size to avoid circular dependency
  useEffect(() => {
    const updateDimensions = () => {
      // Use window dimensions and reserve space for UI elements
      const availableWidth = window.innerWidth - 650 // Account for side panels
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
    const viewBoxWidth = containerDimensions.width / viewport.zoom
    const viewBoxHeight = containerDimensions.height / viewport.zoom
    const viewBoxX = -viewport.offsetX / viewport.zoom
    const viewBoxY = -viewport.offsetY / viewport.zoom
    return { x: viewBoxX, y: viewBoxY, width: viewBoxWidth, height: viewBoxHeight }
  }, [containerDimensions, viewport])

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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    
    const worldPos = screenToWorld(e.clientX, e.clientY)
    const { x, y } = worldPos

    // Check if clicking on an item
    const clickedItem = items.find(item => {
      const itemLeft = item.position.x - item.dimensions.width / 2
      const itemRight = item.position.x + item.dimensions.width / 2
      const itemTop = item.position.y - item.dimensions.height / 2
      const itemBottom = item.position.y + item.dimensions.height / 2
      
      return x >= itemLeft && x <= itemRight && y >= itemTop && y <= itemBottom
    })

    if (clickedItem) {
      selectStudioItem(clickedItem.id)
      draggedItem.current = clickedItem.id
    } else {
      selectStudioItem(null)
    }

    isDragging.current = true
    dragStart.current = { x: e.clientX, y: e.clientY }
  }, [items, screenToWorld, selectStudioItem])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    if (!isDragging.current) return

    const deltaX = e.clientX - dragStart.current.x
    const deltaY = e.clientY - dragStart.current.y

    if (draggedItem.current) {
      // Move item
      const worldDeltaX = deltaX / viewport.zoom
      const worldDeltaY = deltaY / viewport.zoom
      
      const item = items.find(i => i.id === draggedItem.current)
      if (item) {
        updateStudioItemPosition(draggedItem.current, item.position.x + worldDeltaX, item.position.y + worldDeltaY)
      }
    } else {
      // Pan canvas
      updateViewport({
        offsetX: viewport.offsetX + deltaX,
        offsetY: viewport.offsetY + deltaY
      })
    }

    dragStart.current = { x: e.clientX, y: e.clientY }
  }, [isDragging, draggedItem, viewport, items, updateViewport, updateStudioItemPosition])

  const handleMouseUp = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault()
    isDragging.current = false
    draggedItem.current = null
    isRotating.current = false
    rotatingItem.current = null
  }, [])

  // Rotation handlers
  const handleRotationStart = useCallback((itemId: string) => {
    isRotating.current = true
    rotatingItem.current = itemId
    selectStudioItem(itemId)
  }, [selectStudioItem])

  const handleRotationUpdate = useCallback((itemId: string, angle: number) => {
    if (isRotating.current && rotatingItem.current === itemId) {
      updateStudioItemRotation(itemId, angle)
    }
  }, [updateStudioItemRotation])

  const handleRotationEnd = useCallback(() => {
    isRotating.current = false
    rotatingItem.current = null
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
      const newZoom = Math.max(10, Math.min(200, viewport.zoom * zoomFactor))

      // Zoom towards mouse position
      const zoomRatio = newZoom / viewport.zoom
      const newOffsetX = mouseX - (mouseX - viewport.offsetX) * zoomRatio
      const newOffsetY = mouseY - (mouseY - viewport.offsetY) * zoomRatio

      updateViewport({
        zoom: newZoom,
        offsetX: newOffsetX,
        offsetY: newOffsetY
      })
    }

    svg.addEventListener('wheel', handleWheelNative, { passive: false })
    
    return () => {
      svg.removeEventListener('wheel', handleWheelNative)
    }
  }, [viewport, updateViewport])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()

    try {
      const gearItem = JSON.parse(e.dataTransfer.getData('application/json'))
      const worldPos = screenToWorld(e.clientX, e.clientY)
      const { x: worldX, y: worldY } = worldPos
      
      // Check for overlapping items
      const hasOverlap = items.some(item => {
        const dx = Math.abs(item.position.x - worldX)
        const dy = Math.abs(item.position.y - worldY)
        const minDistanceX = (item.dimensions.width + gearItem.dimensions.width) / 2
        const minDistanceY = (item.dimensions.height + gearItem.dimensions.height) / 2
        return dx < minDistanceX && dy < minDistanceY
      })
      
      const newItemId = addStudioItem(gearItem, worldX, worldY)
      selectStudioItem(newItemId)
      
      if (hasOverlap) {
        addLogMessage('warning', `${gearItem.name} may overlap with existing equipment`)
      } else {
        addLogMessage('success', `Added ${gearItem.name} to canvas`)
      }
    } catch (error) {
      console.error('Failed to parse dropped item:', error)
      addLogMessage('warning', 'Failed to add item to canvas - invalid data')
    }
  }, [screenToWorld, addStudioItem, addLogMessage, items])

  const renderItem = (item: StudioItem) => {
    const x = -item.dimensions.width / 2
    const y = -item.dimensions.height / 2
    
    return (
      <g key={item.id}>
        {/* Item group with rotation transform */}
        <g transform={`translate(${item.position.x}, ${item.position.y}) rotate(${item.rotation})`}>
          <rect
            x={x}
            y={y}
            width={item.dimensions.width}
            height={item.dimensions.height}
            fill={item.selected ? '#e3f2fd' : '#f5f5f5'}
            stroke={item.selected ? '#2196f3' : '#666'}
            strokeWidth={item.selected ? 0.02 : 0.01}
            rx={0.05}
          />
          <text
            x={0}
            y={item.dimensions.height / 2 + 0.15}
            textAnchor="middle"
            dominantBaseline="top"
            fontSize={0.1}
            fill="#333"
          >
            {item.name}
          </text>
        </g>
        
        {/* Rotation handle - only show for selected items */}
        {item.selected && (
          <RotationHandle
            itemId={item.id}
            itemPosition={item.position}
            itemDimensions={item.dimensions}
            itemRotation={item.rotation}
            screenToWorld={screenToWorld}
            onRotationStart={handleRotationStart}
            onRotationUpdate={handleRotationUpdate}
            onRotationEnd={handleRotationEnd}
          />
        )}
      </g>
    )
  }

  const renderGrid = () => {
    const gridSize = 0.5 // 0.5m grid
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
          stroke="#e0e0e0"
          strokeWidth={0.005}
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
          stroke="#e0e0e0"
          strokeWidth={0.005}
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
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragStart={(e) => e.preventDefault()}
      >
        {renderGrid()}
        {items.map(renderItem)}
      </svg>
    </div>
  )
}