# StudioFlow - Project Status & Overview

## Project Vision
StudioFlow is a web-based tool for visually designing audio studios, aimed at music producers, engineers, and hobbyists. It provides a drag-and-drop interface for arranging physical audio gear (like racks, mixers, desks, and speakers) in a 2D room layout. Inspired by tools like Figma, IKEA's room planner, and Reason's visual cabling.

## Current Tech Stack
- **Frontend**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 5.4.19 with React plugin (downgraded for Node.js 18 compatibility)
- **State Management**: Zustand 4.4.0
- **2D Graphics**: SVG-based rendering with coordinate transformation
- **3D Graphics**: Three.js 0.157.0 (available but not yet implemented)
- **UI Library**: Mantine 8.2.1 (core + hooks)
- **Utilities**: UUID generation for unique IDs, ESLint for code quality

## Project Structure
```
src/
├── App.tsx                     # Main app component with tabbed layout
├── App.css                     # Application styling
├── main.tsx                    # Entry point with MantineProvider
├── index.css                   # Global styles
├── components/
│   ├── LibraryPanel.tsx        # Gear library with search and selection
│   ├── Canvas.tsx              # Interactive 2D layout canvas with pan/zoom/drag-drop
│   ├── ConnectionsCanvas.tsx   # Visual node editor for cable routing
│   ├── EquipmentPanel.tsx      # Equipment management with properties display
│   ├── LogPanel.tsx            # Connection validation and feedback logging
│   └── PropertiesPanel.tsx     # Detailed item properties and specifications
├── stores/
│   └── studioStore.ts          # Unified data store (Model-View architecture)
├── types/
│   └── StudioItem.ts           # Core type definitions (Library + Studio items)
└── assets/
    ├── react.svg
    └── library_images/         # Product images for gear library
```

## Completed Features

### 1. Model-View Architecture ✅ COMPLETED
- **Unified Data Store**: Single `studioStore` replacing separate library/diagram stores
- **StudioItem** type combining library templates with instance data
- **LibraryItem** templates separate from studio instances
- **Single Source of Truth**: All project data in one place for multiple view types
- **Extensible Design**: Ready for BOM view, project save/load, and additional features

### 2. Core Type System ✅ COMPLETED
- **StudioItem** interface with library data + instance properties (position, canvas state)
- **LibraryItem** templates with dimensions, connections, categories
- **Connection** type for input/output ports with grouping
- **Viewport** interface for canvas pan/zoom state
- **Rack System Types**: Added rack properties (rackUnits, isRack, rackCapacity, mounting relationships)
- Fully typed with TypeScript throughout

### 3. Library Panel ✅ COMPLETED
- Searchable gear library using Mantine components
- Professional UI with Paper containers, shadows, proper spacing
- Split layout: gear list (top) + selected item properties (bottom)
- Sample gear data: Studio Monitors, Audio Interface, Synthesizer, Mixing Console, Rack Equipment
- Real-time filtering by name/category
- Selection highlighting and drag-to-canvas functionality

### 4. Interactive Canvas ✅ COMPLETED
- **SVG-based 2D Canvas**: Precise coordinate system with world/screen transformation
- **Pan & Zoom**: Mouse drag to pan, wheel to zoom (10-200x range)
- **Grid System**: 0.5m grid for precise gear placement
- **Drag-and-Drop**: Seamless drag from library to canvas with accurate positioning
- **Item Selection**: Click to select/deselect with visual highlighting
- **Item Movement**: Drag selected items to reposition on canvas
- **Collision Detection**: Precise click detection using gear dimensions

### 5. Rack Mounting System ✅ COMPLETED
- **Professional Rack Interface**: Adventure game-style inventory system for rack space management
- **19" Standard Rack Support**: Industry-standard 12U rack with 1U = 1.75" height calculation
- **Drag-and-Drop Mounting**: Direct drag from gear library to rack slots with collision detection
- **Multi-Unit Equipment**: Support for 1U, 2U+ equipment with proper slot occupation
- **Visual Rack Representation**: Each rack position clearly labeled (1U-12U) with equipment display
- **Smart Collision Detection**: Prevents overlapping equipment and validates available space
- **Equipment Status Tracking**: Clear badges showing "In Rack" (purple), "In Studio" (green), "Not Placed" (gray)
- **Unmounting System**: Double-click to remove equipment from racks and return to canvas
- **Sample Rack Equipment**: Added 19" Equipment Rack, Focusrite Scarlett 18i20, DBX 266xs Compressor

### 6. Development Infrastructure ✅ COMPLETED
- Mantine UI library fully configured with provider and CSS
- ESLint and TypeScript strict configuration with no errors
- Build and development scripts working perfectly
- WSL-compatible development with Vite polling
- Type-only imports configured for verbatimModuleSyntax

## Sample Data
Currently includes 7 sample gear items with actual product images:
1. **Genelec 1031A** (0.3×0.5m) - Studio monitor with XLR/TRS inputs
2. **MOTU 828** (0.4×0.2m) - 1U rack-mountable audio interface with 2 mic inputs, stereo outputs, headphone out
3. **Roland JP-8000** (1.2×0.4m) - Desktop synthesizer with stereo audio + MIDI I/O
4. **Yamaha O2R** (1.8×0.8m) - Large format digital mixer with 4 channels, main stereo out
5. **19" Equipment Rack** (0.6×0.7m) - Standard 12U rack for mounting compatible equipment
6. **Focusrite Scarlett 18i20** (0.48×0.044m) - 1U rack-mountable audio interface with multiple I/O
7. **DBX 266xs Compressor** (0.48×0.044m) - 1U rack-mountable dual-channel compressor

All items display actual product photos in the properties panel for professional presentation. Rack-mountable equipment (items 2, 6, 7) can be mounted in the 19" rack using the inventory-style rack interface.

## Architecture Highlights

### Model-View Pattern
- **Model**: `studioStore` holds all project data (library templates + studio instances)
- **Views**: Components filter data as needed (`getCanvasItems()`, `getAllStudioItems()`)
- **Future-Ready**: Easy to add BOM view, connections view, project management
- **Clean Separation**: Library templates vs studio instances with proper relationships

### Data Flow
1. **Library Templates** → User drags from library
2. **Studio Instances** → Created with position, canvas state, unique IDs
3. **Canvas View** → Shows `isOnCanvas: true` items
4. **Future BOM View** → Shows all studio items regardless of canvas placement

## Product Vision Alignment

### Current Gap Analysis (vs `/plan/product_overview.txt`)
✅ **Completed**: Drag gear into room layout with professional UI  
✅ **Completed**: Real gear with actual product images and specifications  
✅ **Completed**: Visual cable routing and connection system with full node editor
✅ **Completed**: Connection validation and error checking with smart compatibility rules
✅ **Completed**: Professional rack mounting system with inventory-style interface
❌ **Missing**: BOM/cable list export functionality  
❌ **Missing**: 3D preview capability  

### Target Users
- **Studio designers / AV integrators** - Need client mockups, signal path validation, BOM creation
- **Producers building $10K+ studios** - Need desk/rack layout, ergonomics, routing logic  
- **Music/audio schools** - Need classroom studio planning and team communication

## Unimplemented Required Features

### Professional Export Tools (High Priority)
1. **Bill of Materials (BOM) Export**
   - Cable list with types, lengths, and quantities
   - Gear list with specifications and quantities
   - Export formats: CSV, PDF, professional reports
   - Cost estimation integration (future: Sweetwater API)
2. **Project Management**
   - Save/load studio projects as JSON
   - Project metadata (name, description, created date)
   - Export capabilities (PNG layout diagrams, connection diagrams)

### Enhanced Professional Features (Medium Priority)
1. **Advanced Canvas Features**
   - Item rotation and snapping to grid
   - Multi-select and group operations
   - Copy/paste functionality
   - Undo/redo system
2. **3D Preview**
   - Simple non-editable 3D visualization using Three.js
   - Room perspective with gear placement
   - Cable routing visualization in 3D space

## Technical Notes

### Mantine Integration
- Full component library available (123+ components)
- Theme system ready for customization
- Professional styling with consistent design tokens
- Easy to extend and customize

### Store Architecture
- **Unified studioStore**: Single source of truth for all project data
- **Library Templates**: Read-only gear definitions for dragging
- **Studio Instances**: Copies of templates with position, canvas state, unique IDs
- **View Helpers**: `getCanvasItems()`, `getAllStudioItems()` for different views
- **Type-Safe**: Full TypeScript coverage with proper type relationships

### Development Commands
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run lint` - ESLint checking
- `npx tsc --noEmit` - Type checking

## Files to Reference
- `/plan/plan.txt` - Original design document and MVP specifications
- `src/types/StudioItem.ts` - Core type definitions (LibraryItem + StudioItem)
- `src/stores/studioStore.ts` - Unified data store with Model-View architecture
- `src/components/LibraryPanel.tsx` - Gear library UI implementation
- `src/components/Canvas.tsx` - Interactive 2D canvas implementation
- `src/components/EquipmentPanel.tsx` - Equipment management and properties display

## Recent Development Progress

### Equipment Panel System Complete ✅ (Latest)
- **Professional Equipment Management**: Comprehensive equipment panel with resizable vertical splitter
- **Cable Naming System**: Auto-generated cable names with format "Device A → Device B (Connector Type)"
- **Dual-Mode Operation**: Layout mode (equipment only) vs Connections mode (equipment + cables)
- **Selection Synchronization**: Unified selection across equipment list and canvas/connections views
- **Properties Display**: Detailed gear specifications, dimensions, position, and connection details
- **Professional UI**: Consistent styling with Mantine components and intuitive navigation

### Node Editor Connection System Complete ✅ (Previous)
- **Full Professional Node Editor**: Implemented complete visual cable routing system with draggable connections
- **Smart Validation System**: Professional audio compatibility rules with real-time feedback
- **Curved Connection Lines**: Beautiful cubic Bézier splines for professional appearance
- **Interactive Features**: Click-to-delete connections, visual feedback, professional log panel
- **Dual-View Architecture**: Seamless switching between Layout and Connections tabs
- **Core Differentiator Achieved**: Transforms StudioFlow from generic layout tool to professional studio planning solution

### Major Architecture Refactor
- **Model-View Architecture**: Refactored to unified `studioStore` replacing separate library/diagram stores
- **Data Separation**: Clean separation between library templates and studio instances
- **Single Source of Truth**: All project data centralized for multiple view support
- **Future-Ready Design**: Architecture prepared for BOM view, project save/load, and advanced features
- **Type System Enhancement**: Updated type definitions with proper relationships and extensibility

### Previous Session Improvements
- **Full MVP Canvas**: Complete 2D interactive canvas with pan/zoom/drag-drop
- **Canvas Layout Fix**: Resolved full-width display issue by removing body flex centering
- **Dynamic Grid Rendering**: Updated grid to use actual SVG dimensions instead of hardcoded 800x600
- **Wheel Event Fix**: Fixed passive listener warning by using native event listener with preventDefault
- **WSL Development**: Added Vite polling for proper file watching in WSL environment

## Current Status
✅ **MAJOR MILESTONE ACHIEVED**: Complete Professional Studio Planning Tool
- ✅ **Professional Layout Tool**: Complete with interactive canvas, precise gear placement, actual product images
- ✅ **Visual Cable Routing System**: Full node editor with draggable connections and curved splines  
- ✅ **Smart Connection Validation**: Professional audio compatibility rules with real-time feedback
- ✅ **Equipment Management Panel**: Comprehensive equipment overview with cable naming and properties display
- ✅ **Dual-View Architecture**: Seamless switching between Layout and Connections views with unified equipment panel
- ✅ **Professional Rack System**: Inventory-style rack mounting with 19" standard support and multi-unit equipment
- ✅ **Production-Ready UI**: Optimized for accessibility with large touch targets and clear visual hierarchy

**🎯 PROFESSIONAL STUDIO PLANNING COMPLETE**: StudioFlow now provides complete visual studio design with equipment management, cable routing, rack mounting, and comprehensive project overview - ready for professional use.

## Current Development: Rack Mounting System ✅ COMPLETED

### Rack Mounting System Complete ✅ (Latest)
- **Inventory-Style Interface**: Adventure game-style rack space component showing individual 1U-12U slots
- **RackSpaceComponent**: New component integrated into PropertiesPanel when rack is selected
- **Drag-and-Drop Mounting**: Direct drag from gear library to specific rack positions with visual feedback
- **Multi-Unit Equipment Support**: 1U, 2U+ equipment properly occupies multiple slots with collision detection
- **Position Calculation**: Accurate mapping between drag position and rack slot display (1U=bottom, 12U=top)
- **Equipment Status System**: Clear visual badges showing "In Rack" (purple), "In Studio" (green), "Not Placed" (gray)
- **Smart Unmounting**: Double-click equipment in rack to unmount and return to canvas
- **Sample Rack Equipment**: Added 19" Equipment Rack, Focusrite Scarlett 18i20, DBX 266xs Compressor

### Rack System Architecture
- **Type System Enhancement**: Added rackUnits, isRack, rackCapacity, mountedInRack, rackPosition properties
- **Store Actions**: mountItemInRack, unmountItemFromRack, getRackMountedItems, getAvailableRackPositions
- **Collision Detection**: Prevents overlapping equipment and validates available rack space
- **19" Standard Support**: Industry-standard rack unit calculations (1U = 1.75" = 44px visual height)
- **Position Validation**: Only allows mounting in positions with sufficient consecutive free space
- **State Management**: Automatic canvas removal when mounted in rack, canvas restoration when unmounted

### Technical Implementation
- **Visual Rack Layout**: Each slot clearly labeled with position (1U-12U) and equipment name/size display
- **Async State Handling**: Fixed timing issues with React state updates using setTimeout pattern
- **Position Mapping**: Correct bottom-to-top rack position calculation (position = user drop location)
- **Equipment Creation**: Automatic studio item creation when dragging library items directly to rack
- **Professional UI**: Consistent styling with existing components using Mantine design system

**Next Priority**: BOM/Cable List Export functionality to complete professional workflow tools.