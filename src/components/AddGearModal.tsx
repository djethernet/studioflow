import { useState, useEffect } from 'react'
import { Modal, TextInput, NumberInput, Select, Checkbox, Button, Stack, Group, Divider, Text, Paper, ActionIcon, Box } from '@mantine/core'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import type { Connection, LibraryItem } from '../types/StudioItem'

interface AddGearModalProps {
  opened: boolean
  onClose: () => void
  onSubmit: (gearData: GearFormData) => void
  editingGear?: LibraryItem
  onUpdate?: (gearId: string, gearData: Partial<GearFormData>) => void
}

export interface GearFormData {
  name: string
  productModel: string
  width: number
  height: number
  category: string
  rackUnits?: number
  isRack: boolean
  rackCapacity?: number
  connections: Connection[]
}

const CATEGORIES = [
  'Interface',
  'Mixer', 
  'Speakers',
  'Synth',
  'Processor',
  'Rack',
  'Other'
]

const CONNECTION_TYPES = [
  'XLR',
  '1/4',
  '1/8', 
  'MIDI',
  'USB',
  'TRS',
  'RCA',
  'Optical',
  'BNC'
]

const CONNECTION_CATEGORIES = [
  'unbalanced',
  'balanced',
  'digital',
  'midi',
  'control'
]

export function AddGearModal({ opened, onClose, onSubmit, editingGear, onUpdate }: AddGearModalProps) {
  const isEditMode = Boolean(editingGear)
  const [formData, setFormData] = useState<GearFormData>({
    name: '',
    productModel: '',
    width: 0.5,
    height: 0.3,
    category: 'Other',
    rackUnits: undefined,
    isRack: false,
    rackCapacity: undefined,
    connections: []
  })

  // Initialize form with editing gear data
  useEffect(() => {
    if (editingGear && opened) {
      setFormData({
        name: editingGear.name,
        productModel: editingGear.productModel,
        width: editingGear.dimensions.width,
        height: editingGear.dimensions.height,
        category: editingGear.category || 'Other',
        rackUnits: editingGear.rackUnits,
        isRack: editingGear.isRack || false,
        rackCapacity: editingGear.rackCapacity,
        connections: editingGear.connections || []
      })
    } else if (!editingGear && opened) {
      // Reset form for add mode
      setFormData({
        name: '',
        productModel: '',
        width: 0.5,
        height: 0.3,
        category: 'Other',
        rackUnits: undefined,
        isRack: false,
        rackCapacity: undefined,
        connections: []
      })
    }
  }, [editingGear, opened])

  const [newConnection, setNewConnection] = useState<Partial<Connection>>({
    name: '',
    direction: 'input',
    physical: 'XLR',
    category: 'balanced',
    way: 'socket'
  })

  const handleSubmit = () => {
    if (isEditMode && editingGear && onUpdate) {
      onUpdate(editingGear.id, formData)
    } else {
      onSubmit(formData)
    }
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      name: '',
      productModel: '',
      width: 0.5,
      height: 0.3,
      category: 'Other',
      rackUnits: undefined,
      isRack: false,
      rackCapacity: undefined,
      connections: []
    })
    setNewConnection({
      name: '',
      direction: 'input',
      physical: 'XLR',
      category: 'balanced',
      way: 'socket'
    })
    onClose()
  }

  const addConnection = () => {
    if (!newConnection.name) return

    const connection: Connection = {
      id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newConnection.name!,
      direction: newConnection.direction as 'input' | 'output',
      physical: newConnection.physical!,
      category: newConnection.category!,
      way: newConnection.way as 'plug' | 'socket'
    }

    setFormData(prev => ({
      ...prev,
      connections: [...prev.connections, connection]
    }))

    setNewConnection({
      name: '',
      direction: 'input',
      physical: 'XLR',
      category: 'balanced',
      way: 'socket'
    })
  }

  const removeConnection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      connections: prev.connections.filter((_, i) => i !== index)
    }))
  }

  const isFormValid = formData.name && formData.productModel && formData.width > 0 && formData.height > 0

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={isEditMode ? "Edit Custom Gear" : "Add Custom Gear"}
      size="lg"
    >
      <Stack gap="md">
        <TextInput
          label="Name"
          placeholder="e.g., My Custom Mixer"
          required
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        />

        <TextInput
          label="Product Model"
          placeholder="e.g., SSL Matrix 2"
          required
          value={formData.productModel}
          onChange={(e) => setFormData(prev => ({ ...prev, productModel: e.target.value }))}
        />

        <Group grow>
          <NumberInput
            label="Width (m)"
            placeholder="0.5"
            min={0.1}
            max={5.0}
            step={0.1}
            decimalScale={1}
            required
            value={formData.width}
            onChange={(value) => setFormData(prev => ({ ...prev, width: (value as number) || 0.5 }))}
          />
          <NumberInput
            label="Height (m)"
            placeholder="0.3"
            min={0.1}
            max={5.0}
            step={0.1}
            decimalScale={1}
            required
            value={formData.height}
            onChange={(value) => setFormData(prev => ({ ...prev, height: (value as number) || 0.3 }))}
          />
        </Group>

        <Select
          label="Category"
          placeholder="Select category"
          data={CATEGORIES}
          value={formData.category}
          onChange={(value) => setFormData(prev => ({ ...prev, category: value || 'Other' }))}
        />

        <NumberInput
          label="Rack Units (optional)"
          placeholder="e.g., 1 for 1U equipment"
          min={1}
          max={12}
          value={formData.rackUnits}
          onChange={(value) => setFormData(prev => ({ ...prev, rackUnits: (value as number) || undefined }))}
        />

        <Checkbox
          label="This item is a rack that can hold other equipment"
          checked={formData.isRack}
          onChange={(e) => setFormData(prev => ({ ...prev, isRack: e.target.checked }))}
        />

        {formData.isRack && (
          <NumberInput
            label="Rack Capacity (U)"
            placeholder="e.g., 12 for 12U rack"
            min={1}
            max={48}
            required
            value={formData.rackCapacity}
            onChange={(value) => setFormData(prev => ({ ...prev, rackCapacity: (value as number) || undefined }))}
          />
        )}

        <Divider label="Connections" labelPosition="left" />

        <Paper p="sm" bg="gray.0">
          <Text size="sm" fw={500} mb="sm">Add New Connection</Text>
          <Stack gap="xs">
            <TextInput
              placeholder="Connection name"
              value={newConnection.name}
              onChange={(e) => setNewConnection(prev => ({ ...prev, name: e.target.value }))}
            />
            <Group grow>
              <Select
                placeholder="Direction"
                data={[
                  { value: 'input', label: 'Input' },
                  { value: 'output', label: 'Output' }
                ]}
                value={newConnection.direction}
                onChange={(value) => setNewConnection(prev => ({ ...prev, direction: value as 'input' | 'output' }))}
              />
              <Select
                placeholder="Physical connector"
                data={CONNECTION_TYPES}
                value={newConnection.physical}
                onChange={(value) => setNewConnection(prev => ({ ...prev, physical: value as Connection['physical'] }))}
              />
            </Group>
            <Group grow>
              <Select
                placeholder="Category"
                data={CONNECTION_CATEGORIES}
                value={newConnection.category}
                onChange={(value) => setNewConnection(prev => ({ ...prev, category: value as Connection['category'] }))}
              />
              <Select
                placeholder="Port type"
                data={[
                  { value: 'socket', label: 'Socket (Female)' },
                  { value: 'plug', label: 'Plug (Male)' }
                ]}
                value={newConnection.way}
                onChange={(value) => setNewConnection(prev => ({ ...prev, way: value as 'plug' | 'socket' }))}
              />
            </Group>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={addConnection}
              disabled={!newConnection.name}
              size="sm"
            >
              Add Connection
            </Button>
          </Stack>
        </Paper>

        {formData.connections.length > 0 && (
          <Box>
            <Text size="sm" fw={500} mb="xs">Current Connections ({formData.connections.length})</Text>
            <Stack gap="xs">
              {formData.connections.map((conn, index) => (
                <Paper key={index} p="xs" bg="blue.0">
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" fw={500}>{conn.name}</Text>
                      <Text size="xs" c="dimmed">
                        {conn.direction} • {conn.physical} • {conn.category} • {conn.way}
                      </Text>
                    </div>
                    <ActionIcon
                      color="red"
                      variant="light"
                      size="sm"
                      onClick={() => removeConnection(index)}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid}>
            {isEditMode ? 'Update Gear' : 'Add Gear'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}