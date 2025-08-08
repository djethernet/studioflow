import { useState, useEffect, useCallback } from 'react'
import { Box, Text, TextInput, ScrollArea, Stack, Paper, Button, Group, Loader, Alert, Select, Badge, ActionIcon, Menu, Modal } from '@mantine/core'
import { IconPlus, IconAlertCircle, IconDots, IconEdit, IconTrash } from '@tabler/icons-react'
import { useStudioStore } from '../stores/studioStore'
import { PropertiesPanel } from './PropertiesPanel'
import { AddGearModal, type GearFormData } from './AddGearModal'
import type { LibraryItem } from '../types/StudioItem'

const CATEGORIES = [
  'All Categories',
  'Interface',
  'Mixer', 
  'Speakers',
  'Synth',
  'Processor',
  'Rack',
  'Other'
]

export function LibraryPanel() {
  const { 
    selectedLibraryItem, 
    searchQuery, 
    categoryFilter,
    libraryItems,
    libraryLoading,
    libraryError,
    libraryHasMore,
    setSelectedLibraryItem, 
    setSearchQuery,
    setCategoryFilter,
    loadGear,
    loadMoreGear,
    addLibraryItem,
    updateLibraryItem,
    deleteLibraryItem,
    getFilteredLibraryItems
  } = useStudioStore()
  
  const [splitHeight, setSplitHeight] = useState(60) // Percentage for gear list
  const [addModalOpened, setAddModalOpened] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [editingGear, setEditingGear] = useState<LibraryItem | null>(null)
  const [deleteModalOpened, setDeleteModalOpened] = useState(false)
  const [gearToDelete, setGearToDelete] = useState<LibraryItem | null>(null)
  const filteredItems = getFilteredLibraryItems()

  // Load gear on component mount
  useEffect(() => {
    if (libraryItems.length === 0 && !libraryLoading) {
      loadGear()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reload when search or category changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery || categoryFilter) {
        loadGear()
      }
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, categoryFilter])

  const handleItemClick = (item: LibraryItem) => {
    setSelectedLibraryItem(item)
  }

  const handleDragStart = (e: React.DragEvent, item: LibraryItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item))
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleAddGear = async (gearData: GearFormData) => {
    try {
      await addLibraryItem(gearData)
      setAddModalOpened(false)
    } catch (error) {
      // Error is already handled in the store and logged
      console.error('Failed to add gear:', error)
    }
  }

  const handleEditGear = async (gearId: string, gearData: Partial<GearFormData>) => {
    try {
      await updateLibraryItem(gearId, gearData)
      setEditingGear(null)
      setAddModalOpened(false)
    } catch (error) {
      console.error('Failed to update gear:', error)
    }
  }

  const handleDeleteGear = async () => {
    if (!gearToDelete) return
    
    try {
      await deleteLibraryItem(gearToDelete.id)
      setDeleteModalOpened(false)
      setGearToDelete(null)
      // Clear selection if deleted item was selected
      if (selectedLibraryItem?.id === gearToDelete.id) {
        setSelectedLibraryItem(null)
      }
    } catch (error) {
      console.error('Failed to delete gear:', error)
    }
  }

  const openEditModal = (gear: LibraryItem) => {
    setEditingGear(gear)
    setAddModalOpened(true)
  }

  const openDeleteModal = (gear: LibraryItem) => {
    setGearToDelete(gear)
    setDeleteModalOpened(true)
  }

  const closeAddModal = () => {
    setAddModalOpened(false)
    setEditingGear(null)
  }

  const handleCategoryChange = (category: string | null) => {
    setCategoryFilter(category === 'All Categories' ? '' : category || '')
  }


  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !libraryHasMore) return
    
    setIsLoadingMore(true)
    try {
      await loadMoreGear()
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, libraryHasMore, loadMoreGear])

  // Handle scroll for infinite loading
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget
    const { scrollTop, scrollHeight, clientHeight } = element
    
    // Load more when scrolled to bottom (with 100px threshold)
    if (scrollHeight - scrollTop - clientHeight < 100 && libraryHasMore && !libraryLoading && !isLoadingMore) {
      handleLoadMore()
    }
  }, [handleLoadMore, libraryHasMore, libraryLoading, isLoadingMore])

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
            <Group>
              <Text fw={700} size="lg">Catalog</Text>
              <Badge size="sm" color="blue">{filteredItems.length}</Badge>
            </Group>
            <Button
              leftSection={<IconPlus size={16} />}
              size="xs"
              onClick={() => setAddModalOpened(true)}
            >
              Add Gear
            </Button>
          </Group>
          
          <Stack gap="xs">
            <TextInput
              placeholder="Search gear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select
              placeholder="Filter by category"
              data={CATEGORIES}
              value={categoryFilter || 'All Categories'}
              onChange={handleCategoryChange}
            />
          </Stack>
        </Box>
        
        {libraryError && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            color="red" 
            mb="sm"
            variant="light"
          >
            {libraryError}
          </Alert>
        )}
        
        <ScrollArea 
          style={{ flex: 1 }} 
          onScrollCapture={handleScroll}
        >
          <Stack gap="xs">
            {libraryLoading && filteredItems.length === 0 && (
              <Group justify="center" py="xl">
                <Loader size="sm" />
                <Text size="sm" c="dimmed">Loading gear...</Text>
              </Group>
            )}
            
            {filteredItems.map((item) => (
              <Paper
                key={item.id}
                p="sm"
                withBorder
                style={{
                  cursor: 'grab',
                  backgroundColor: selectedLibraryItem?.id === item.id ? '#f0f8ff' : '#fafafa',
                  borderColor: selectedLibraryItem?.id === item.id ? '#4a90e2' : '#e0e0e0',
                  borderStyle: 'dashed',
                  borderWidth: '2px'
                }}
                onClick={() => handleItemClick(item)}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
              >
                <Group gap="sm">
                  <Badge variant="light" color="teal" size="xs">
                    {item.category || 'Equipment'}
                  </Badge>
                  <Text size="sm" fw={500} style={{ flex: 1 }}>
                    {item.name}
                  </Text>
                  {item.isOfficial ? (
                    <Badge variant="outline" color="blue" size="xs">
                      Official
                    </Badge>
                  ) : (
                    <Badge variant="filled" color="orange" size="xs">
                      Custom
                    </Badge>
                  )}
                  {!item.isOfficial && (
                    <Menu shadow="md" width={120}>
                      <Menu.Target>
                        <ActionIcon
                          size="sm"
                          variant="light"
                          color="gray"
                          onClick={(e) => {
                            e.stopPropagation() // Prevent item selection
                          }}
                          title="Edit options"
                        >
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconEdit size={14} />}
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditModal(item)
                          }}
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconTrash size={14} />}
                          color="red"
                          onClick={(e) => {
                            e.stopPropagation()
                            openDeleteModal(item)
                          }}
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  )}
                </Group>
              </Paper>
            ))}
            
            {isLoadingMore && (
              <Group justify="center" py="sm">
                <Loader size="sm" />
                <Text size="xs" c="dimmed">Loading more...</Text>
              </Group>
            )}
            
            {!libraryHasMore && filteredItems.length > 0 && (
              <Text size="xs" c="dimmed" ta="center" py="sm">
                All gear loaded
              </Text>
            )}
            
            {!libraryLoading && filteredItems.length === 0 && !libraryError && (
              <Text size="sm" c="dimmed" ta="center" py="xl">
                {searchQuery || categoryFilter ? 'No gear matches your filters' : 'No gear available'}
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
          selectedLibraryItem={selectedLibraryItem || undefined}
          allowNameEditing={false}
        />
      </Paper>

      <AddGearModal
        opened={addModalOpened}
        onClose={closeAddModal}
        onSubmit={handleAddGear}
        editingGear={editingGear || undefined}
        onUpdate={handleEditGear}
      />

      <Modal
        opened={deleteModalOpened}
        onClose={() => {
          setDeleteModalOpened(false)
          setGearToDelete(null)
        }}
        title="Delete Custom Gear"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete "{gearToDelete?.name}"? This action cannot be undone.
          </Text>
          <Group justify="flex-end">
            <Button
              variant="light"
              onClick={() => {
                setDeleteModalOpened(false)
                setGearToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button color="red" onClick={handleDeleteGear}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  )
}