import { Box, Text, TextInput, ScrollArea, Group, Stack, Paper, Divider, Image } from '@mantine/core'
import { useStudioStore } from '../stores/studioStore'
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
        
        <Box>
          {selectedLibraryItem ? (
            <Stack gap="xs">
              <Group gap="md" align="flex-start">
                <Image 
                  src={selectedLibraryItem.icon} 
                  alt={selectedLibraryItem.name}
                  w={80}
                  h={60}
                  fit="cover"
                  radius="sm"
                />
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Text size="md" fw={600}>{selectedLibraryItem.name}</Text>
                  <Text size="sm">
                    <Text span fw={500}>Size:</Text> {selectedLibraryItem.dimensions.width}m × {selectedLibraryItem.dimensions.height}m
                  </Text>
                  <Text size="sm">
                    <Text span fw={500}>Inputs:</Text> {selectedLibraryItem.connections.filter(c => c.direction === 'input').length}
                  </Text>
                  <Text size="sm">
                    <Text span fw={500}>Outputs:</Text> {selectedLibraryItem.connections.filter(c => c.direction === 'output').length}
                  </Text>
                  {selectedLibraryItem.category && (
                    <Text size="sm">
                      <Text span fw={500}>Category:</Text> {selectedLibraryItem.category}
                    </Text>
                  )}
                </Stack>
              </Group>
            </Stack>
          ) : (
            <Text size="sm" c="dimmed">
              Select an item to view its properties
            </Text>
          )}
        </Box>
      </Stack>
    </Paper>
  )
}