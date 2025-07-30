import { LibraryPanel } from './components/LibraryPanel'
import { Canvas } from './components/Canvas'

function App() {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <LibraryPanel />
      <Canvas />
    </div>
  )
}

export default App


