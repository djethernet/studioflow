import { useState } from 'react'
import { useDiagramStore } from '../stores/diagramStore'

type Props = {
  id: string
  x: number
  y: number
}

export default function DraggableItem({ id, x, y }: Props) {
  const updateItemPosition = useDiagramStore((s) => s.updateItemPosition)
  const [dragging, setDragging] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    setDragging(true)
    setOffset({ x: e.clientX - x, y: e.clientY - y })
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!dragging) return
    const newX = e.clientX - offset.x
    const newY = e.clientY - offset.y
    updateItemPosition(id, newX, newY)
  }

  function handleMouseUp() {
    setDragging(false)
  }

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 100,
        height: 60,
        backgroundColor: '#4ade80', // green
        border: '2px solid #15803d',
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
    >
      ? Gear
    </div>
  )
}

