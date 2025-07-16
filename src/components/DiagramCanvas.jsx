import { useDiagramStore } from '../stores/diagramStore'

export default function DiagramCanvas() {
  const { diagram, addItem } = useDiagramStore()

  return (
    <div className="border p-4">
      <button onClick={() => addItem({ id: crypto.randomUUID(), type: 'synth', position: { x: 100, y: 100 } })}>
        Add Synth
      </button>
      <pre>{JSON.stringify(diagram, null, 2)}</pre>
    </div>
  )
}
