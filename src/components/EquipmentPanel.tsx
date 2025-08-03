import { useState } from 'react'
import { Paper, Text, Group, Stack, Divider, Badge, ScrollArea } from '@mantine/core'
import { useStudioStore } from '../stores/studioStore'
import { PropertiesPanel } from './PropertiesPanel'
import type { StudioItem, NodeConnection } from '../types/StudioItem'

interface EquipmentPanelProps {
  showConnections?: boolean // Show connections in list when true (for Connections tab)
}

export function EquipmentPanel({ showConnections = false }: EquipmentPanelProps) {
  const { 
    getAllStudioItems, 
    getNodeConnections, 
    selectedStudioItemId, 
    selectStudioItem,
    updateStudioItemName
  } = useStudioStore()

  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null)
  const [splitHeight, setSplitHeight] = useState(50) // Percentage for equipment list

  const studioItems = getAllStudioItems()
  const connections = getNodeConnections()

  // Get the currently selected item for properties display
  const selectedItem = studioItems.find(item => item.id === selectedStudioItemId)
  const selectedConnection = connections.find(conn => conn.id === selectedConnectionId)

  const handleItemSelect = (item: StudioItem) => {
    selectStudioItem(item.id)
    setSelectedConnectionId(null) // Clear connection selection
  }

  const handleConnectionSelect = (connection: NodeConnection) => {
    setSelectedConnectionId(connection.id)
    selectStudioItem(null) // Clear item selection
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const startY = e.clientY
    const startHeight = splitHeight
    const containerHeight = e.currentTarget.parentElement?.clientHeight || 400

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - startY
      const deltaPercent = (deltaY / containerHeight) * 100
      const newHeight = Math.max(20, Math.min(80, startHeight + deltaPercent))
      setSplitHeight(newHeight)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div style={{ width: '350px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Equipment List */}
      <Paper 
        shadow="sm" 
        p="md" 
        style={{ 
          height: `${splitHeight}%`, 
          display: 'flex', 
          flexDirection: 'column',
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Text fw={600} mb="sm">Equipment List</Text>
        <ScrollArea style={{ flex: 1 }}>
          <Stack gap="xs">
            {/* Studio Items */}
            {studioItems.map((item) => (
              <Paper
                key={item.id}
                p="sm"
                withBorder
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedStudioItemId === item.id ? '#f0f8ff' : undefined,
                  borderColor: selectedStudioItemId === item.id ? '#4a90e2' : undefined
                }}
                onClick={() => handleItemSelect(item)}
              >
                <Group gap="sm">
                  <Badge variant="light" color="blue" size="xs">
                    {item.category || 'Equipment'}
                  </Badge>
                  <Text size="sm" fw={500} style={{ flex: 1 }}>
                    {item.name}
                  </Text>
                  {item.isOnCanvas && (
                    <Badge variant="filled" color="green" size="xs">
                      In Studio
                    </Badge>
                  )}
                </Group>
              </Paper>
            ))}

            {/* Connections (if enabled) */}
            {showConnections && connections.length > 0 && (
              <>
                <Divider label="Connections" />
                {connections.map((connection) => (
                  <Paper
                    key={connection.id}
                    p="sm"
                    withBorder
                    style={{
                      cursor: 'pointer',
                      backgroundColor: selectedConnectionId === connection.id ? '#f0f8ff' : undefined,
                      borderColor: selectedConnectionId === connection.id ? '#4a90e2' : undefined
                    }}
                    onClick={() => handleConnectionSelect(connection)}
                  >
                    <Group gap="sm">
                      <Badge variant="light" color="orange" size="xs">
                        Cable
                      </Badge>
                      <Text size="sm" fw={500} style={{ flex: 1 }}>
                        {connection.name}
                      </Text>
                    </Group>
                  </Paper>
                ))}
              </>
            )}

            {studioItems.length === 0 && (!showConnections || connections.length === 0) && (
              <Text size="sm" c="dimmed" ta="center" py="xl">
                No equipment in project
              </Text>
            )}
          </Stack>
        </ScrollArea>
      </Paper>

      {/* Resizer */}
      <div
        style={{
          height: '4px',
          backgroundColor: '#e0e0e0',
          cursor: 'row-resize',
          borderTop: '1px solid #ccc',
          borderBottom: '1px solid #ccc'
        }}
        onMouseDown={handleMouseDown}
      />

      {/* Properties Panel */}
      <Paper 
        shadow="sm" 
        p="md" 
        style={{ 
          height: `${100 - splitHeight}%`, 
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        <Text fw={600} mb="sm">Properties</Text>
        <PropertiesPanel
          selectedItem={selectedItem}
          selectedConnection={selectedConnection}
          allowNameEditing={true}
          onNameUpdate={updateStudioItemName}
          studioItems={studioItems}
        />
      </Paper>
    </div>
  )
}