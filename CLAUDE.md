# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
**IMPORTANT**: Always read `/PROJECT_STATUS.md` first to understand the current state of the StudioFlow project. This file contains:
- Complete project vision and goals
- Current tech stack and architecture
- Completed features and implementation status
- Sample data and type definitions
- Next phase goals and development roadmap

StudioFlow is a web-based tool for visually designing audio studios with drag-and-drop functionality for arranging physical audio gear in 2D room layouts.

## Development Commands

### Core Commands
- `npm run dev` - Start development server with Vite and hot module replacement
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run lint` - Run ESLint on all TypeScript/TSX files
- `npm run preview` - Preview production build locally

### Linting and Type Checking
After making code changes, always run:
- `npm run lint` - Check for linting issues
- `npx tsc --noEmit` - Type check without emitting files (since build includes tsc -b)

## Project Architecture

### Tech Stack
- **Frontend**: React 19.1.0 with TypeScript
- **Build Tool**: Vite 7.0.4 with React plugin
- **State Management**: Zustand 4.4.0
- **3D Graphics**: Three.js 0.157.0
- **Utilities**: UUID generation, ESLint for code quality

### Project Structure
- `src/App.tsx` - Main application component (currently minimal)
- `src/main.tsx` - React application entry point with StrictMode
- `src/components/` - React components (currently empty)
- `src/stores/` - Zustand state management stores (currently empty)
- `src/assets/` - Static assets

### Configuration Files
- `vite.config.ts` - Standard Vite configuration with React plugin
- `tsconfig.json` - TypeScript project references setup
- `tsconfig.app.json` - App-specific TypeScript configuration
- `tsconfig.node.json` - Node-specific TypeScript configuration
- `eslint.config.js` - ESLint configuration with TypeScript, React Hooks, and React Refresh rules

### Key Dependencies
- React DOM for rendering
- Three.js for 3D graphics capabilities
- Zustand for lightweight state management
- UUID for unique identifier generation

This is a new React + TypeScript + Vite project with modern tooling setup. The application structure is minimal and ready for development of interactive 3D applications using Three.js.