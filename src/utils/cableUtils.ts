import type { Connection } from '../types/StudioItem'

/**
 * Formats a cable name with connector types and way information
 * Shows way (port/socket) only for XLR, MIDI, and BNC connectors
 * @param fromConnection - Source connection object
 * @param toConnection - Destination connection object  
 * @param fromWay - Cable end way for source (opposite of device connection way)
 * @param toWay - Cable end way for destination (opposite of device connection way)
 * @returns Formatted cable name string
 */
export function formatCableName(
  fromConnection: Connection,
  toConnection: Connection,
  fromWay: 'plug' | 'socket',
  toWay: 'plug' | 'socket'
): string {
  // Connector types that should show way information
  const showWayFor = ['XLR', 'MIDI', 'BNC']
  
  // Format connector with way if applicable
  const formatConnector = (connection: Connection, way: 'plug' | 'socket') => {
    const connectorType = connection.physical
    if (showWayFor.includes(connectorType)) {
      return `${connectorType} ${way}`
    }
    return connectorType
  }
  
  const fromConnector = formatConnector(fromConnection, fromWay)
  const toConnector = formatConnector(toConnection, toWay)
  
  // Check if it's a conversion cable (different connector types)
  const isConversion = fromConnection.physical !== toConnection.physical
  
  return `${fromConnector} to ${toConnector}${isConversion ? ' Conversion' : ''} cable`
}