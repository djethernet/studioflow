import { useState } from 'react'
import { Box, Text, TextInput, ScrollArea, Stack, Paper, Button, Group } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useStudioStore } from '../stores/studioStore'
import { PropertiesPanel } from './PropertiesPanel'
import { AddGearModal, type GearFormData } from './AddGearModal'
import type { LibraryItem } from '../types/StudioItem'

export function LibraryPanel() {
  const { 
    selectedLibraryItem, 
    searchQuery, 
    setSelectedLibraryItem, 
    setSearchQuery, 
    getFilteredLibraryItems,
    addLibraryItem
  } = useStudioStore()
  
  const [splitHeight, setSplitHeight] = useState(60) // Percentage for gear list
  const [addModalOpened, setAddModalOpened] = useState(false)
  const filteredItems = getFilteredLibraryItems()

  const handleItemClick = (item: LibraryItem) => {
    setSelectedLibraryItem(item)
  }

  const handleDragStart = (e: React.DragEvent, item: LibraryItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item))
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleAddGear = (gearData: GearFormData) => {
    addLibraryItem(gearData)
    setAddModalOpened(false)
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
    <div style={{ width: '300px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Gear Library List */}
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
        <Box mb="sm">
          <Group justify="space-between" mb="sm">
            <Text fw={700} size="lg">Catalog</Text>
            <Button
              leftSection={<IconPlus size={16} />}
              size="xs"
              onClick={() => setAddModalOpened(true)}
            >
              Add Gear
            </Button>
          </Group>
          <TextInput
            placeholder="Search gear..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </Box>
        
        <ScrollArea style={{ flex: 1 }}>
          <Stack gap="xs">
            {filteredItems.map((item) => (
              <Paper
                key={item.id}
                p="sm"
                bg={selectedLibraryItem?.id === item.id ? 'blue.1' : 'gray.0'}
                style={{ cursor: 'grab' }}
                onClick={() => handleItemClick(item)}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
              >
                <Text size="sm" fw={500}>{item.name}</Text>
              </Paper>
            ))}
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
          selectedLibraryItem={selectedLibraryItem || undefined}
          allowNameEditing={false}
        />
      </Paper>

      <AddGearModal
        opened={addModalOpened}
        onClose={() => setAddModalOpened(false)}
        onSubmit={handleAddGear}
      />
    </div>
  )
}