import { useRef, useCallback, useEffect, useState } from 'react'
import { useStudioStore } from '../stores/studioStore'
import type { StudioItem } from '../types/StudioItem'

export function Canvas() {
  const { 
    getCanvasItems, 
    viewport, 
    updateViewport, 
    selectStudioItem, 
    updateStudioItemPosition, 
    addStudioItem,
    addLogMessage 
  } = useStudioStore()
  const items = getCanvasItems()
  const svgRef = useRef<SVGSVGElement>(null)
  const isDragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const draggedItem = useRef<string | null>(null)
  const [svgDimensions, setSvgDimensions] = useState({ width: 800, height: 600 })

  // Update SVG dimensions when ref becomes available or window resizes
  useEffect(() => {
    const updateDimensions = () => {
      const rect = svgRef.current?.getBoundingClientRect()
      if (rect) {
        setSvgDimensions({ width: rect.width, height: rect.height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    
    return () => {
      window.removeEventListener('resize', updateDimensions)
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
    const viewBoxWidth = rect.width / viewport.zoom
    const viewBoxHeight = rect.height / viewport.zoom
    const viewBoxX = -viewport.offsetX / viewport.zoom
    const viewBoxY = -viewport.offsetY / viewport.zoom
    
    const x = viewBoxX + (normalizedX * viewBoxWidth)
    const y = viewBoxY + (normalizedY * viewBoxHeight)

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
  }, [items, viewport, selectStudioItem])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
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

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    draggedItem.current = null
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
    
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return

    try {
      const gearItem = JSON.parse(e.dataTransfer.getData('application/json'))
      
      // Get mouse position relative to SVG
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      // Convert to normalized coordinates (0-1)
      const normalizedX = mouseX / rect.width
      const normalizedY = mouseY / rect.height
      
      // Convert to world coordinates using viewBox
      const viewBoxWidth = rect.width / viewport.zoom
      const viewBoxHeight = rect.height / viewport.zoom
      const viewBoxX = -viewport.offsetX / viewport.zoom
      const viewBoxY = -viewport.offsetY / viewport.zoom
      
      const worldX = viewBoxX + (normalizedX * viewBoxWidth)
      const worldY = viewBoxY + (normalizedY * viewBoxHeight)
      
      // Check for overlapping items
      const hasOverlap = items.some(item => {
        const dx = Math.abs(item.position.x - worldX)
        const dy = Math.abs(item.position.y - worldY)
        const minDistanceX = (item.dimensions.width + gearItem.dimensions.width) / 2
        const minDistanceY = (item.dimensions.height + gearItem.dimensions.height) / 2
        return dx < minDistanceX && dy < minDistanceY
      })
      
      addStudioItem(gearItem, worldX, worldY)
      
      if (hasOverlap) {
        addLogMessage('warning', `${gearItem.name} may overlap with existing equipment`)
      } else {
        addLogMessage('success', `Added ${gearItem.name} to canvas`)
      }
    } catch (error) {
      console.error('Failed to parse dropped item:', error)
      addLogMessage('warning', 'Failed to add item to canvas - invalid data')
    }
  }, [viewport, addStudioItem, addLogMessage, items])

  const renderItem = (item: StudioItem) => {
    const x = item.position.x - item.dimensions.width / 2
    const y = item.position.y - item.dimensions.height / 2
    
    return (
      <g key={item.id}>
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
          x={item.position.x}
          y={item.position.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={0.1}
          fill="#333"
        >
          {item.name}
        </text>
      </g>
    )
  }

  const renderGrid = () => {
    const gridSize = 0.5 // 0.5m grid
    const viewBox = {
      left: -viewport.offsetX / viewport.zoom,
      top: -viewport.offsetY / viewport.zoom,
      width: svgDimensions.width / viewport.zoom,
      height: svgDimensions.height / viewport.zoom
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
          stroke="#e0e0e0"
          strokeWidth={0.005}
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
          stroke="#e0e0e0"
          strokeWidth={0.005}
        />
      )
    }

    return <g>{lines}</g>
  }

  const viewBoxWidth = svgDimensions.width / viewport.zoom
  const viewBoxHeight = svgDimensions.height / viewport.zoom

  return (
    <div style={{ flex: 1, overflow: 'hidden', cursor: isDragging.current ? 'grabbing' : 'grab' }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`${-viewport.offsetX / viewport.zoom} ${-viewport.offsetY / viewport.zoom} ${viewBoxWidth} ${viewBoxHeight}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {renderGrid()}
        {items.map(renderItem)}
      </svg>
    </div>
  )
}