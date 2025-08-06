import React from 'react'
import { Paper, Title, Group, Button, Table, Badge, Stack, Text, Divider } from '@mantine/core'
import { useStudioStore } from '../stores/studioStore'
import { IconDownload, IconFileText } from '@tabler/icons-react'
import type { StudioItem } from '../types/StudioItem'

export function BOMPanel() {
  const { getAllStudioItems, getNodeConnections } = useStudioStore()
  
  const allItems = getAllStudioItems()
  const allConnections = getNodeConnections()

  // Group equipment by category and count duplicates
  const equipmentGroups = allItems.reduce((groups, item) => {
    const key = `${item.name}-${item.productModel}`
    if (!groups[key]) {
      groups[key] = {
        item,
        quantity: 0,
        category: item.category || 'Other'
      }
    }
    groups[key].quantity += 1
    return groups
  }, {} as Record<string, { item: StudioItem, quantity: number, category: string }>)

  const equipmentRows = Object.values(equipmentGroups).map((group) => (
    <Table.Tr key={`${group.item.name}-${group.item.productModel}`}>
      <Table.Td>{group.item.name}</Table.Td>
      <Table.Td>{group.item.productModel}</Table.Td>
      <Table.Td>
        <Badge color="blue" variant="light">
          {group.category}
        </Badge>
      </Table.Td>
      <Table.Td>{group.quantity}</Table.Td>
      <Table.Td>
        {group.item.dimensions 
          ? `${group.item.dimensions.width}m × ${group.item.dimensions.height}m`
          : 'N/A'
        }
      </Table.Td>
    </Table.Tr>
  ))

  const cableRows = allConnections.map((connection) => (
    <Table.Tr key={connection.id}>
      <Table.Td>{connection.name}</Table.Td>
      <Table.Td>
        <Badge color="green" variant="light">
          {connection.length}m
        </Badge>
      </Table.Td>
      <Table.Td>1</Table.Td>
    </Table.Tr>
  ))

  const exportToCSV = () => {
    const csvData = [
      ['Project Summary - Equipment'],
      ['Item Name', 'Product Model', 'Category', 'Quantity', 'Dimensions'],
      ...Object.values(equipmentGroups).map(group => [
        group.item.name,
        group.item.productModel,
        group.category,
        group.quantity.toString(),
        group.item.dimensions 
          ? `${group.item.dimensions.width}m × ${group.item.dimensions.height}m`
          : 'N/A'
      ]),
      [''],
      ['Cable List'],
      ['Cable Name', 'Length', 'Quantity'],
      ...allConnections.map(connection => [
        connection.name,
        `${connection.length}m`,
        '1'
      ])
    ]

    const csvContent = csvData.map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'studio-project-summary.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      <Paper 
        shadow="sm" 
        p="lg" 
        style={{ 
          flex: 1, 
          margin: '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Group justify="space-between" mb="md">
          <Title order={2}>Project Summary</Title>
          <Group>
            <Button 
              leftSection={<IconDownload size={16} />}
              onClick={exportToCSV}
              variant="filled"
            >
              Export CSV
            </Button>
            <Button 
              leftSection={<IconFileText size={16} />}
              variant="outline"
              disabled
            >
              Export PDF
            </Button>
          </Group>
        </Group>

        <div style={{ flex: 1, overflow: 'auto' }}>
          <Stack gap="xl">
            {/* Equipment Section */}
            <div>
              <Group mb="md">
                <Title order={3}>Equipment ({Object.values(equipmentGroups).reduce((sum, g) => sum + g.quantity, 0)} items)</Title>
              </Group>
              
              {equipmentRows.length > 0 ? (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Item Name</Table.Th>
                      <Table.Th>Product Model</Table.Th>
                      <Table.Th>Category</Table.Th>
                      <Table.Th>Quantity</Table.Th>
                      <Table.Th>Dimensions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {equipmentRows}
                  </Table.Tbody>
                </Table>
              ) : (
                <Text c="dimmed" ta="center" py="xl">
                  No equipment added to studio yet
                </Text>
              )}
            </div>

            <Divider />

            {/* Cables Section */}
            <div>
              <Group mb="md">
                <Title order={3}>Cables ({allConnections.length} cables)</Title>
              </Group>
              
              {cableRows.length > 0 ? (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Cable Name</Table.Th>
                      <Table.Th>Length</Table.Th>
                      <Table.Th>Quantity</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {cableRows}
                  </Table.Tbody>
                </Table>
              ) : (
                <Text c="dimmed" ta="center" py="xl">
                  No cables connected yet
                </Text>
              )}
            </div>

            {/* Summary Section */}
            <Divider />
            <div>
              <Title order={3} mb="md">Summary</Title>
              <Group>
                <Badge size="lg" color="blue" variant="light">
                  {Object.values(equipmentGroups).reduce((sum, g) => sum + g.quantity, 0)} Equipment Items
                </Badge>
                <Badge size="lg" color="green" variant="light">
                  {allConnections.length} Cables
                </Badge>
                <Badge size="lg" color="orange" variant="light">
                  {allConnections.reduce((sum, conn) => sum + conn.length, 0).toFixed(1)}m Total Cable Length
                </Badge>
              </Group>
            </div>
          </Stack>
        </div>
      </Paper>
    </div>
  )
}