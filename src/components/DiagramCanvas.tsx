import { useDiagramStore } from '../stores/diagramStore'
import DraggableItem from './DraggableItem'
import { v4 as uuidv4 } from 'uuid'

export default function DiagramCanvas() {
  const { items, addItem } = useDiagramStore()

  function handleAdd() {
    addItem({
      id: uuidv4(),
      type: 'synth',
      x: 100,
      y: 100,
    })
  }

  return (
    <div className="relative w-full h-screen bg-gray-100">
      <button 
        onClick={handleAdd}
        className="absolute top-2 left-2 z-10 bg-blue-500 text-white px-2 py-1 rounded"
      >
        Add Gear
      </button>
      {items.map((item) => (
        <DraggableItem
          key={item.id}
          id={item.id}
          x={item.x}
          y={item.y}
        />
      ))}
    </div>
  )
}

