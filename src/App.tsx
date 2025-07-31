import { useState } from 'react'
import { Tabs } from '@mantine/core'
import { LibraryPanel } from './components/LibraryPanel'
import { Canvas } from './components/Canvas'
import { ConnectionsCanvas } from './components/ConnectionsCanvas'

function App() {
  const [activeTab, setActiveTab] = useState<string | null>('layout')

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Tabs value={activeTab} onChange={setActiveTab} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Tabs.List>
          <Tabs.Tab value="layout">Layout</Tabs.Tab>
          <Tabs.Tab value="connections">Connections</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="layout" style={{ flex: 1, display: 'flex' }}>
          <LibraryPanel />
          <Canvas />
        </Tabs.Panel>

        <Tabs.Panel value="connections" style={{ flex: 1, display: 'flex' }}>
          <ConnectionsCanvas />
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}

export default App


