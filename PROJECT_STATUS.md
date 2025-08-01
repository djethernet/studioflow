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
├── App.tsx                     # Main app component (shows LibraryPanel + Canvas)
├── main.tsx                    # Entry point with MantineProvider
├── components/
│   ├── LibraryPanel.tsx        # Gear library with search and selection
│   └── Canvas.tsx              # Interactive 2D canvas with pan/zoom/drag-drop
├── stores/
│   └── studioStore.ts          # Unified data store (Model-View architecture)
├── types/
│   └── StudioItem.ts           # Core type definitions (Library + Studio items)
└── assets/
    └── react.svg
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
- Fully typed with TypeScript throughout

### 3. Library Panel ✅ COMPLETED
- Searchable gear library using Mantine components
- Professional UI with Paper containers, shadows, proper spacing
- Split layout: gear list (top) + selected item properties (bottom)
- Sample gear data: Studio Monitors, Audio Interface, Synthesizer, Mixing Console
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

### 5. Development Infrastructure ✅ COMPLETED
- Mantine UI library fully configured with provider and CSS
- ESLint and TypeScript strict configuration with no errors
- Build and development scripts working perfectly
- WSL-compatible development with Vite polling
- Type-only imports configured for verbatimModuleSyntax

## Sample Data
Currently includes 4 sample gear items with actual product images:
1. **Genelec 1031A** (0.3×0.5m) - XLR/TRS inputs
2. **MOTU 828** (0.4×0.2m) - 2 mic inputs, stereo outputs, headphone out
3. **Roland JP-8000** (1.2×0.4m) - Stereo audio + MIDI I/O
4. **Yamaha O2R** (1.8×0.8m) - 4 channel inputs, main stereo out

All items now display actual product photos in the properties panel for professional presentation.

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
❌ **Missing**: BOM/cable list export functionality  
❌ **Missing**: 3D preview capability  

### Target Users
- **Studio designers / AV integrators** - Need client mockups, signal path validation, BOM creation
- **Producers building $10K+ studios** - Need desk/rack layout, ergonomics, routing logic  
- **Music/audio schools** - Need classroom studio planning and team communication

## Next Phase Goals

### Node Editor Connection System ✅ COMPLETED - Core Differentiator
**Full Professional Node Editor Implementation**

#### Phase 1: Tab System Implementation ✅ COMPLETED
- ✅ Tab navigation using Mantine Tabs component
- ✅ Layout tab: Spatial gear arrangement canvas
- ✅ Connections tab: Node editor view for signal routing
- ✅ Seamless switching between views with maintained functionality

#### Phase 2: Connections View Foundation ✅ COMPLETED
- ✅ Independent coordinate system with separate SVG canvas
- ✅ Automatic node appearance when items added to Layout
- ✅ Grid-based auto-positioning for new nodes (4-column layout)
- ✅ Full pan/zoom functionality matching Layout view
- ✅ Node positioning completely independent of Layout spatial positions

#### Phase 3: Node Editor UI & Enhanced Type System ✅ COMPLETED
**Store Enhancements:**
- ✅ Extended Connection type with full professional audio specifications:
  - `id: string` - Unique connection identifier
  - `direction: 'input' | 'output'` - Signal flow direction
  - `physical: 'XLR' | '1/4' | '1/8' | 'MIDI' | 'USB' | 'TRS' | 'RCA'` - Physical connector
  - `category: 'unbalanced' | 'balanced' | 'digital' | 'midi'` - Signal category
  - `way: 'port' | 'socket'` - Male/female connector type
  - `name: string` - Human-readable connection name
- ✅ NodeConnection type for tracking connections between nodes
- ✅ Full connection state management in unified store
- ✅ Separate connection viewport and node positioning system

**Professional Node UI Implementation:**
- ✅ Clean SVG-based node boxes with professional shadows
- ✅ Node headers with gear names (2x larger text for readability)
- ✅ Left column: Input connections with blue circles
- ✅ Right column: Output connections with red circles  
- ✅ Large, clickable connection circles (2x size for accessibility)
- ✅ Professional Mantine theme color integration
- ✅ Optimized spacing and alignment for usability

#### Phase 4: Interactive Connection System ✅ COMPLETED
- ✅ **Draggable Connections**: Click and drag from output to input circles
- ✅ **Curved Connection Lines**: Beautiful cubic Bézier splines for professional appearance
- ✅ **Smart Validation System**: 
  - Output → Input direction enforcement
  - Category compatibility (balanced ↔ unbalanced, exact matches)
  - Device self-connection prevention
  - Existing connection conflict detection
- ✅ **Interactive Features**:
  - Click existing connections to delete
  - Real-time visual feedback during dragging
  - Professional log panel notifications for all operations
- ✅ **Visual Polish**:
  - Curved connection paths with control points
  - Connection indicator dots at endpoints  
  - Dashed preview lines during dragging
  - Proper hit detection zones for large touch targets

**Technical Architecture:**
```typescript
interface NodeConnection {
  id: string;
  fromNodeId: string;
  fromConnectionId: string;
  toNodeId: string;
  toConnectionId: string;
  type: ConnectionType;
}

interface ConnectionsViewState {
  nodePositions: Map<string, {x: number, y: number}>;
  viewport: Viewport;
  connections: NodeConnection[];
}
```

### Phase 2B - Professional Export Tools (High Priority)
1. **Bill of Materials (BOM) Export**

### Phase 2B - Professional Export Tools (High Priority)
1. **Bill of Materials (BOM) Export**
   - Cable list with types, lengths, and quantities
   - Gear list with specifications and quantities
   - Export formats: CSV, PDF, professional reports
   - Cost estimation integration (future: Sweetwater API)

2. **Project Management**
   - Save/load studio projects as JSON
   - Project metadata (name, description, created date)
   - Export capabilities (PNG layout diagrams, connection diagrams)

### Phase 2C - Enhanced Professional Features (Medium Priority)
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

## Recent Development Progress

### Major Architecture Refactor (Latest)
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

### Recent Commits
- `439b3d7` - **Update library to use actual gear images instead of emojis**
- `cd3ac15` - Update PROJECT_STATUS.md with Model-View architecture documentation
- `e23e142` - **Refactor to unified Model-View architecture with single data store**
- `1d7c916` - Update PROJECT_STATUS.md with latest session improvements
- `0036cf2` - Fix wheel event passive listener warning in Canvas

## Current Status
✅ **MAJOR MILESTONE ACHIEVED**: Full Professional Node Editor Complete
- ✅ **Professional Layout Tool**: Complete with interactive canvas, precise gear placement, actual product images
- ✅ **Visual Cable Routing System**: Full node editor with draggable connections and curved splines  
- ✅ **Smart Connection Validation**: Professional audio compatibility rules with real-time feedback
- ✅ **Dual-View Architecture**: Seamless switching between Layout and Connections views
- ✅ **Production-Ready UI**: Optimized for accessibility with large touch targets and clear visual hierarchy

**🎯 CORE DIFFERENTIATOR ACHIEVED**: StudioFlow now has the visual cable routing system that transforms it from a generic layout tool into a professional studio planning solution.

**Next Priority Phase 2B**: Export tools (BOM generation, project save/load) to complete the professional workflow.