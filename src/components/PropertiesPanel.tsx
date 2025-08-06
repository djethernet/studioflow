import { useState } from 'react'
import { Text, Group, Stack, Image, Badge, ScrollArea, TextInput, ActionIcon, Divider } from '@mantine/core'
import { IconEdit, IconCheck, IconX } from '@tabler/icons-react'
import type { StudioItem, LibraryItem, NodeConnection } from '../types/StudioItem'
import { RackSpaceComponent } from './RackSpaceComponent'

interface PropertiesPanelProps {
  // Item data
  selectedItem?: StudioItem
  selectedLibraryItem?: LibraryItem
  selectedConnection?: NodeConnection

  // Editing capabilities
  allowNameEditing?: boolean
  onNameUpdate?: (id: string, name: string) => void

  // Additional data for studio items
  studioItems?: StudioItem[]
}

export function PropertiesPanel({
  selectedItem,
  selectedLibraryItem,
  selectedConnection,
  allowNameEditing = false,
  onNameUpdate,
  studioItems = []
}: PropertiesPanelProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editingName, setEditingName] = useState('')

  // Determine which item to display (StudioItem takes precedence)
  const displayItem = selectedItem || selectedLibraryItem
  const isStudioItem = !!selectedItem

  const handleStartEditName = (item: StudioItem | LibraryItem) => {
    setEditingName(item.name)
    setIsEditingName(true)
  }

  const handleSaveName = () => {
    if (selectedItem && editingName.trim() && onNameUpdate) {
      onNameUpdate(selectedItem.id, editingName.trim())
    }
    setIsEditingName(false)
    setEditingName('')
  }

  const handleCancelEdit = () => {
    setIsEditingName(false)
    setEditingName('')
  }

  return (
    <ScrollArea style={{ flex: 1 }}>
      {displayItem && (
        <Stack gap="md">
          {/* Item Image */}
          {displayItem.icon && (
            <Image
              src={displayItem.icon}
              alt={displayItem.name}
              h={120}
              fit="contain"
              style={{ border: '1px solid #e0e0e0', borderRadius: '4px' }}
            />
          )}

          {/* Basic Info */}
          <div>
            {isEditingName && allowNameEditing ? (
              <Group gap="xs" mb="xs">
                <TextInput
                  value={editingName}
                  onChange={(e) => setEditingName(e.currentTarget.value)}
                  size="sm"
                  style={{ flex: 1 }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName()
                    if (e.key === 'Escape') handleCancelEdit()
                  }}
                  autoFocus
                />
                <ActionIcon color="green" size="sm" onClick={handleSaveName}>
                  <IconCheck size={14} />
                </ActionIcon>
                <ActionIcon color="red" size="sm" onClick={handleCancelEdit}>
                  <IconX size={14} />
                </ActionIcon>
              </Group>
            ) : (
              <Group gap="xs" mb="xs">
                <Text fw={600} size="lg" style={{ flex: 1 }}>{displayItem.name}</Text>
                {allowNameEditing && isStudioItem && (
                  <ActionIcon size="sm" onClick={() => handleStartEditName(displayItem)}>
                    <IconEdit size={14} />
                  </ActionIcon>
                )}
              </Group>
            )}
            {displayItem.productModel && (
              <Text size="sm" fw={500} c="dimmed">{displayItem.productModel}</Text>
            )}
            <Text size="sm" c="dimmed">{displayItem.category}</Text>
          </div>

          {/* Dimensions */}
          <div>
            <Text fw={500} size="sm" mb="xs">Dimensions</Text>
            <Text size="sm">
              {displayItem.dimensions.width}m × {displayItem.dimensions.height}m
            </Text>
          </div>

          {/* Position (Studio Items only) */}
          {isStudioItem && selectedItem && (
            <div>
              <Text fw={500} size="sm" mb="xs">Position</Text>
              <Text size="sm">
                X: {selectedItem.position.x.toFixed(2)}m, Y: {selectedItem.position.y.toFixed(2)}m
              </Text>
              {selectedItem.mountedInRack && (
                <Text size="sm" c="blue">
                  Mounted in rack at position {selectedItem.rackPosition}U
                </Text>
              )}
            </div>
          )}

          {/* Rack Units (for rack-mountable items) */}
          {displayItem.rackUnits && displayItem.rackUnits > 0 && (
            <div>
              <Text fw={500} size="sm" mb="xs">Rack Size</Text>
              <Text size="sm">{displayItem.rackUnits}U</Text>
            </div>
          )}

          {/* Rack Space Component (for racks) */}
          {isStudioItem && selectedItem && selectedItem.isRack && (
            <>
              <Divider />
              <RackSpaceComponent rack={selectedItem} />
            </>
          )}

          {/* Connections */}
          <div>
            <Text fw={500} size="sm" mb="xs">Connections ({displayItem.connections.length})</Text>
            <Stack gap="xs">
              {displayItem.connections.map((conn) => (
                <Group key={conn.id} p="xs" style={{ border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                  <div style={{ flex: 1 }}>
                    <Text size="xs" fw={500}>{conn.name}</Text>
                  </div>
                  <Group gap="xs">
                    <Badge variant="light" color={conn.direction === 'input' ? 'blue' : 'green'} size="xs">
                      {conn.direction}
                    </Badge>
                    <Badge variant="outline" size="xs">
                      {conn.physical}
                    </Badge>
                  </Group>
                </Group>
              ))}
            </Stack>
          </div>
        </Stack>
      )}

      {selectedConnection && (
        <Stack gap="md">
          {/* Connection Info */}
          <div>
            <Text fw={600} size="lg">{selectedConnection.name}</Text>
            <Text size="sm" c="dimmed">Cable Connection</Text>
          </div>

          {/* Connection Details */}
          <div>
            <Group p="md" style={{ border: '1px solid #e0e0e0', borderRadius: '4px' }}>
              <Stack gap="sm" style={{ flex: 1 }}>
                {/* Cable and Conversion Badges */}

                {/* From/To Information */}
                <Stack gap="xs">
                  <Text size="sm">
                    {(() => {
                      const fromNode = studioItems.find(item => item.id === selectedConnection.fromNodeId)
                      const toNode = studioItems.find(item => item.id === selectedConnection.toNodeId)
                      const fromConnection = fromNode?.connections.find(conn => conn.id === selectedConnection.fromConnectionId)
                      const toConnection = toNode?.connections.find(conn => conn.id === selectedConnection.toConnectionId)
                      const isConversion = fromConnection && toConnection && fromConnection.physical !== toConnection.physical
                      return (
                        <div>
                          <Group gap="sm">
                            <Badge variant="light" color="orange" size="xs">
                              Cable
                            </Badge>
                            <Text size="sm" fw={500} style={{ flex: 1 }}>
                              {fromConnection?.physical} to  {toConnection?.physical}
                              {isConversion ? " Conversion" : ""} Cable
                            </Text>
                          </Group>

                          <Text>{fromNode?.name} {fromConnection?.name}</Text>
                          <Text component="span" fw={500}>→ </Text>
                          <Text> {toNode?.name} {toConnection?.name}</Text>
                        </div>
                      )
                    }
                    )()}
                  </Text>
                </Stack>
              </Stack>
            </Group>
          </div>
        </Stack>
      )}

      {!displayItem && !selectedConnection && (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          Select an item to view properties
        </Text>
      )}
    </ScrollArea>
  )
}