import { Box, Text, TextInput, ScrollArea, Stack, Paper, Divider } from '@mantine/core'
import { useStudioStore } from '../stores/studioStore'
import { PropertiesPanel } from './PropertiesPanel'
import type { LibraryItem } from '../types/StudioItem'

export function LibraryPanel() {
  const { 
    selectedLibraryItem, 
    searchQuery, 
    setSelectedLibraryItem, 
    setSearchQuery, 
    getFilteredLibraryItems 
  } = useStudioStore()
  
  const filteredItems = getFilteredLibraryItems()

  const handleItemClick = (item: LibraryItem) => {
    setSelectedLibraryItem(item)
  }

  const handleDragStart = (e: React.DragEvent, item: LibraryItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item))
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <Paper shadow="sm" p="md" h="100vh" w={300} style={{ display: 'flex', flexDirection: 'column' }}>
      <Stack gap="md" style={{ flex: 1 }}>
        <Box>
          <Text size="lg" fw={600} mb="sm">Gear Library</Text>
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
        
        <Divider />
        
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Text fw={600} mb="sm">Properties</Text>
          <PropertiesPanel
            selectedLibraryItem={selectedLibraryItem || undefined}
            allowNameEditing={false}
          />
        </Box>
      </Stack>
    </Paper>
  )
}