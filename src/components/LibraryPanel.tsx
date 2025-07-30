import { Box, Text, TextInput, ScrollArea, Group, Stack, Paper, Divider } from '@mantine/core'
import { useLibraryStore } from '../stores/libraryStore'
import type { LibraryItem } from '../types/LibraryItem'

export function LibraryPanel() {
  const { 
    selectedItem, 
    searchQuery, 
    setSelectedItem, 
    setSearchQuery, 
    getFilteredItems 
  } = useLibraryStore()
  
  const filteredItems = getFilteredItems()

  const handleItemClick = (item: LibraryItem) => {
    setSelectedItem(item)
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
                bg={selectedItem?.id === item.id ? 'blue.1' : 'gray.0'}
                style={{ cursor: 'pointer' }}
                onClick={() => handleItemClick(item)}
              >
                <Group gap="sm">
                  <Text size="lg">{item.icon || '🎛️'}</Text>
                  <Text size="sm" fw={500}>{item.name}</Text>
                </Group>
              </Paper>
            ))}
          </Stack>
        </ScrollArea>
        
        <Divider />
        
        <Box>
          {selectedItem ? (
            <Stack gap="xs">
              <Text size="md" fw={600}>{selectedItem.name}</Text>
              <Text size="sm">
                <Text span fw={500}>Size:</Text> {selectedItem.dimensions.width}m × {selectedItem.dimensions.height}m
              </Text>
              <Text size="sm">
                <Text span fw={500}>Inputs:</Text> {selectedItem.connections.filter(c => c.direction === 'input').length}
              </Text>
              <Text size="sm">
                <Text span fw={500}>Outputs:</Text> {selectedItem.connections.filter(c => c.direction === 'output').length}
              </Text>
              {selectedItem.category && (
                <Text size="sm">
                  <Text span fw={500}>Category:</Text> {selectedItem.category}
                </Text>
              )}
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