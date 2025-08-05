import { Box, Text, Group, Stack } from '@mantine/core'
import { useStudioStore } from '../stores/studioStore'
import type { StudioItem, LibraryItem } from '../types/StudioItem'

interface RackSpaceComponentProps {
  rack: StudioItem
}

interface RackSlotProps {
  position: number
  isEmpty: boolean
  item?: StudioItem
  onDrop: (item: LibraryItem | StudioItem, position: number) => void
  onDoubleClick?: (item: StudioItem) => void
}

function RackSlot({ position, isEmpty, item, onDrop, onDoubleClick }: RackSlotProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const draggedData = e.dataTransfer.getData('application/json')
    if (draggedData) {
      const draggedItem = JSON.parse(draggedData)
      onDrop(draggedItem, position)
    }
  }

  return (
    <Box
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        height: '44px', // 1U = 44.45mm ≈ 44px
        border: '1px solid #ddd',
        borderRadius: '4px',
        backgroundColor: isEmpty ? '#f8f9fa' : '#e9ecef',
        display: 'flex',
        alignItems: 'center',
        padding: '4px 8px',
        cursor: isEmpty ? 'pointer' : 'default',
        position: 'relative'
      }}
    >
      <Text size="xs" c="dimmed" style={{ position: 'absolute', left: '4px', top: '2px' }}>
        {position}U
      </Text>
      
      {item && (
        <Group 
          gap="xs" 
          style={{ width: '100%', paddingLeft: '24px' }}
          onDoubleClick={() => item && onDoubleClick && onDoubleClick(item)}
        >
          <img 
            src={item.icon} 
            alt={item.name}
            style={{ width: '24px', height: '24px', objectFit: 'contain' }}
          />
          <Text size="sm" truncate style={{ flex: 1 }}>
            {item.name}
          </Text>
          <Text size="xs" c="dimmed">
            {item.rackUnits}U
          </Text>
        </Group>
      )}
      
      {isEmpty && (
        <Text size="xs" c="dimmed" style={{ paddingLeft: '24px' }}>
          Drop equipment here
        </Text>
      )}
    </Box>
  )
}

export function RackSpaceComponent({ rack }: RackSpaceComponentProps) {
  const {
    getRackMountedItems,
    mountItemInRack,
    unmountItemFromRack,
    getAvailableRackPositions,
    addStudioItem,
    studioItems
  } = useStudioStore()

  if (!rack.isRack || !rack.rackCapacity) {
    return null
  }

  const rackCapacity = rack.rackCapacity
  const mountedItems = getRackMountedItems(rack.id)
  
  // Create rack layout - array representing each rack unit
  const rackLayout: (StudioItem | null)[] = new Array(rackCapacity).fill(null)
  
  // Fill in mounted items
  mountedItems.forEach((item: StudioItem) => {
    if (item.rackPosition && item.rackUnits) {
      // Mark all positions occupied by this item
      for (let i = 0; i < item.rackUnits; i++) {
        const slotIndex = rackCapacity - (item.rackPosition + i) // Reverse for top-to-bottom display
        if (slotIndex >= 0 && slotIndex < rackCapacity) {
          rackLayout[slotIndex] = item
        }
      }
    }
  })

  const handleItemDrop = (draggedItem: LibraryItem | StudioItem, position: number) => {
    // Position is already the correct rack position (1U = bottom, 12U = top)
    const rackPosition = position
    
    let itemToMount: StudioItem | null = null
    let rackUnits = 1

    if ('libraryItemId' in draggedItem) {
      // It's already a StudioItem
      itemToMount = draggedItem
      rackUnits = draggedItem.rackUnits || 1
    } else {
      // It's a LibraryItem - check if it's rack-mountable
      if (!draggedItem.rackUnits || draggedItem.rackUnits <= 0) {
        return // Not rack-mountable
      }
      
      // Find if this library item is already a studio item that's not mounted
      const existingStudioItem = studioItems.find(item => 
        item.libraryItemId === draggedItem.id && !item.mountedInRack
      )
      
      if (existingStudioItem) {
        // Use existing studio item
        itemToMount = existingStudioItem
        rackUnits = draggedItem.rackUnits
      } else {
        // Create new studio item directly for rack mounting
        // Use rack position for initial placement, but don't put on canvas (onCanvas: false)
        const newItemId = addStudioItem(draggedItem, rack.position.x, rack.position.y, false)
        
        // Use setTimeout to ensure the state has updated before mounting
        if (newItemId) {
          setTimeout(() => {
            const availablePositions = getAvailableRackPositions(rack.id, draggedItem.rackUnits || 1)
            if (availablePositions.includes(rackPosition)) {
              mountItemInRack(newItemId, rack.id, rackPosition)
            }
          }, 0)
        }
        return // Exit early since we handled the mounting asynchronously
      }
    }

    if (!itemToMount) return

    // Check if item is already mounted elsewhere
    if (itemToMount.mountedInRack && itemToMount.mountedInRack !== rack.id) {
      unmountItemFromRack(itemToMount.id)
    }

    // Check if position can fit the item
    const availablePositions = getAvailableRackPositions(rack.id, rackUnits)
    if (availablePositions.includes(rackPosition)) {
      mountItemInRack(itemToMount.id, rack.id, rackPosition)
    }
  }

  const handleItemDoubleClick = (item: StudioItem) => {
    unmountItemFromRack(item.id)
  }

  return (
    <Box>
      <Text size="sm" fw={500} mb="xs">
        Rack Space ({rackCapacity}U)
      </Text>
      
      <Stack gap="xs">
        {rackLayout.map((item, index) => {
          const actualPosition = rackCapacity - index
          
          // Skip slots that are part of a multi-unit item (not the first slot)
          if (item && item.rackPosition && item.rackUnits) {
            const itemStartSlot = rackCapacity - (item.rackPosition + item.rackUnits - 1)
            if (index !== itemStartSlot) {
              return null // This slot is part of the item above
            }
          }
          
          return (
            <RackSlot
              key={actualPosition}
              position={actualPosition}
              isEmpty={!item}
              item={item || undefined}
              onDrop={handleItemDrop}
              onDoubleClick={handleItemDoubleClick}
            />
          )
        })}
      </Stack>
      
      <Text size="xs" c="dimmed" mt="xs">
        Drag rack-mountable equipment from the library to mount it in the rack.
        Double-click mounted equipment to unmount it.
      </Text>
    </Box>
  )
}