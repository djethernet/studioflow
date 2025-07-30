# StudioFlow - Project Status & Overview

## Project Vision
StudioFlow is a web-based tool for visually designing audio studios, aimed at music producers, engineers, and hobbyists. It provides a drag-and-drop interface for arranging physical audio gear (like racks, mixers, desks, and speakers) in a 2D room layout. Inspired by tools like Figma, IKEA's room planner, and Reason's visual cabling.

## Current Tech Stack
- **Frontend**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 7.0.4 with React plugin
- **State Management**: Zustand 4.4.0
- **3D Graphics**: Three.js 0.157.0 (not yet implemented)
- **UI Library**: Mantine 8.2.1 (core + hooks)
- **Utilities**: UUID generation, ESLint for code quality

## Project Structure
```
src/
├── App.tsx                     # Main app component (shows LibraryPanel)
├── main.tsx                    # Entry point with MantineProvider
├── components/
│   └── LibraryPanel.tsx        # Gear library with search and selection
├── stores/
│   ├── diagramStore.tsx        # Canvas items and viewport state
│   └── libraryStore.ts         # Gear library state and filtering
├── types/
│   └── LibraryItem.ts          # Core gear item type definitions
└── assets/
    └── react.svg
```

## Completed Features

### 1. Core Type System
- **LibraryItem** interface with dimensions, connections, position, rotation
- **Connection** type for input/output ports
- **Dimensions** and **Position** interfaces
- Fully typed with TypeScript

### 2. Library Panel (COMPLETED)
- Searchable gear library using Mantine components
- Professional UI with Paper containers, shadows, proper spacing
- Split layout: gear list (top) + selected item properties (bottom)
- Sample gear data: Studio Monitors, Audio Interface, Synthesizer, Mixing Console
- Real-time filtering by name/category
- Selection highlighting and hover states

### 3. State Management
- **Library Store**: Manages gear library, search, selection using Zustand
- **Diagram Store**: Ready for canvas items and viewport management
- Proper separation of concerns

### 4. Development Setup
- Mantine UI library fully configured with provider and CSS
- ESLint and TypeScript strict configuration
- Build and development scripts working
- Type-only imports configured for verbatimModuleSyntax

## Sample Data
Currently includes 4 sample gear items:
1. **Studio Monitors** (0.3×0.5m) - XLR/TRS inputs
2. **Audio Interface** (0.4×0.2m) - 2 mic inputs, stereo outputs, headphone out
3. **Synthesizer** (1.2×0.4m) - Stereo audio + MIDI I/O
4. **Mixing Console** (1.8×0.8m) - 4 channel inputs, main stereo out

## Next Phase Goals (From Plan)

### Phase 1 - MVP Core Features
1. **2D Layout Canvas** (NOT STARTED)
   - Drag-and-drop canvas for placing studio gear
   - Grid snapping system
   - Move, rotate, align gear items
   - Top-down room view

2. **Canvas Integration** (NOT STARTED)
   - Connect LibraryPanel to canvas
   - Drag items from library to canvas
   - Create instances of LibraryItems on canvas

3. **Basic Interactions** (NOT STARTED)
   - Select/deselect items on canvas
   - Move items around canvas
   - Basic properties panel for selected canvas items

## Technical Notes

### Mantine Integration
- Full component library available (123+ components)
- Theme system ready for customization
- Professional styling with consistent design tokens
- Easy to extend and customize

### State Architecture
- Library items are template objects
- Canvas will create instances with unique positions
- Zustand stores handle all state management
- Type-safe throughout

### Development Commands
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run lint` - ESLint checking
- `npx tsc --noEmit` - Type checking

## Files to Reference
- `/plan/plan.txt` - Original design document and MVP specifications
- `src/types/LibraryItem.ts` - Core type definitions
- `src/stores/libraryStore.ts` - Library state management
- `src/components/LibraryPanel.tsx` - Current UI implementation

## Recent Commits
- `5e04e1c` - Add Mantine UI library and update LibraryPanel styling
- `7266cbb` - Implement library panel with gear selection and search
- `d20bf03` - Move plan to visible directory and add diagram store

## Ready for Next Steps
The foundation is solid. Next logical steps would be:
1. Create the main canvas component for item placement
2. Implement drag-and-drop from library to canvas
3. Add basic item manipulation (move, rotate, select)
4. Connect the two systems via shared state

The project is well-architected and ready for the core canvas functionality that will make it a functional studio planning tool.