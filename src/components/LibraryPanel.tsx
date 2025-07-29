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
    <div className="library-panel">
      <div className="library-header">
        <h3>Gear Library</h3>
        <input
          type="text"
          placeholder="Search gear..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="library-content">
        <div className="gear-list">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`gear-item ${selectedItem?.id === item.id ? 'selected' : ''}`}
              onClick={() => handleItemClick(item)}
            >
              <div className="gear-icon">
                {item.icon || '🎛️'}
              </div>
              <div className="gear-name">{item.name}</div>
            </div>
          ))}
        </div>
        
        <div className="item-properties">
          {selectedItem ? (
            <div>
              <h4>{selectedItem.name}</h4>
              <div className="property">
                <strong>Size:</strong> {selectedItem.dimensions.width}m × {selectedItem.dimensions.height}m
              </div>
              <div className="property">
                <strong>Inputs:</strong> {selectedItem.connections.filter(c => c.direction === 'input').length}
              </div>
              <div className="property">
                <strong>Outputs:</strong> {selectedItem.connections.filter(c => c.direction === 'output').length}
              </div>
              {selectedItem.category && (
                <div className="property">
                  <strong>Category:</strong> {selectedItem.category}
                </div>
              )}
            </div>
          ) : (
            <div className="no-selection">
              Select an item to view its properties
            </div>
          )}
        </div>
      </div>
    </div>
  )
}