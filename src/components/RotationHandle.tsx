import { useCallback, useEffect, useRef } from 'react'

interface RotationHandleProps {
  itemId: string
  itemPosition: { x: number; y: number }
  itemDimensions: { width: number; height: number }
  itemRotation: number
  onRotationStart: (itemId: string) => void
  onRotationUpdate: (itemId: string, angle: number) => void
  onRotationEnd: () => void
}

export function RotationHandle({
  itemId,
  itemPosition,
  itemDimensions,
  itemRotation,
  onRotationStart,
  onRotationUpdate,
  onRotationEnd
}: RotationHandleProps) {
  const handleRadius = 0.08
  const handleDistance = Math.max(itemDimensions.width, itemDimensions.height) / 2 + 0.15
  const isRotating = useRef(false)

  // Calculate handle position relative to item center, accounting for item rotation
  const handleX = itemPosition.x + handleDistance * Math.sin((itemRotation * Math.PI) / 180)
  const handleY = itemPosition.y - handleDistance * Math.cos((itemRotation * Math.PI) / 180)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    isRotating.current = true
    onRotationStart(itemId)
  }, [itemId, onRotationStart])

  // Global mouse handlers for rotation
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isRotating.current) return
      
      const svgElement = document.querySelector('svg')
      if (!svgElement) return
      
      const rect = svgElement.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      // Convert screen coordinates to SVG world coordinates
      const viewBox = svgElement.viewBox.baseVal
      const normalizedX = (mouseX / rect.width) * viewBox.width + viewBox.x
      const normalizedY = (mouseY / rect.height) * viewBox.height + viewBox.y
      
      // Calculate angle from item center to mouse position
      const dx = normalizedX - itemPosition.x
      const dy = normalizedY - itemPosition.y
      const rawAngle = Math.atan2(dx, -dy) * 180 / Math.PI
      
      // Snap to 15-degree increments
      const snapIncrement = 15
      const snappedAngle = Math.round(rawAngle / snapIncrement) * snapIncrement
      
      onRotationUpdate(itemId, snappedAngle)
    }

    const handleGlobalMouseUp = () => {
      if (isRotating.current) {
        isRotating.current = false
        onRotationEnd()
      }
    }

    // Always add the event listeners
    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [itemId, itemPosition, onRotationUpdate, onRotationEnd])

  return (
    <g transform={`translate(${handleX}, ${handleY})`}>
      {/* Handle circle background */}
      <circle
        cx={0}
        cy={0}
        r={handleRadius}
        fill="white"
        stroke="#2196f3"
        strokeWidth={0.01}
        style={{ cursor: 'grab' }}
        onMouseDown={handleMouseDown}
      />
      
      {/* Circular arrow icon */}
      <g transform="scale(0.4)">
        <path
          d="M -0.1,-0.05 A 0.1,0.1 0 1,1 0.05,0.1 L 0.08,0.06 L 0.02,0.12 L 0.08,0.06 L 0.12,0.02"
          fill="none"
          stroke="#2196f3"
          strokeWidth={0.02}
          strokeLinecap="round"
          strokeLinejoin="round"
          pointerEvents="none"
        />
      </g>
      
      {/* Connection line to item */}
      <line
        x1={0}
        y1={0}
        x2={-handleDistance * Math.sin((itemRotation * Math.PI) / 180)}
        y2={handleDistance * Math.cos((itemRotation * Math.PI) / 180)}
        stroke="#2196f3"
        strokeWidth={0.005}
        strokeDasharray="0.02,0.02"
        pointerEvents="none"
      />
    </g>
  )
}