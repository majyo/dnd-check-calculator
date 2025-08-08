# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a D&D 5e skill check calculator built with React, TypeScript, and Vite. The application allows users to manage players, create skill check events, run check sessions, and track session history. All data is persisted in localStorage.

## Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production (TypeScript compilation + Vite build)
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Core Data Flow
- **State Management**: Pure React state with localStorage persistence
- **Data Structure**: Players → Events → Check Sessions → Check Items
- **Storage**: All data automatically saved to localStorage with JSON serialization

### Key Components Structure
- `App.tsx`: Main application with tab navigation and state management
- `PlayerManager`: Manages player roster with skills and modifiers
- `EventManager`: Creates skill check events with DC values
- `CheckSessionCreator`: Combines players and events into check sessions
- `CheckSessionManager`: Handles active session with dice rolling and result tracking
- `SessionHistoryManager`: Lists and manages completed/archived sessions
- `DataManager`: Data export/import functionality

### Data Types
- **Player**: Has ID, name, and skill modifiers (Record<string, number>)
- **SkillCheckEvent**: Defines skill, DC, and description
- **CheckItem**: Individual check with player, event, dice roll, and result
- **CheckSession**: Collection of check items with status tracking

### Skill System
- Uses Chinese skill names (18 D&D 5e skills)
- English-to-Chinese translation mapping in `types.ts`
- Supports custom bonuses, advantage/disadvantage mechanics
- Automatic success/failure calculation based on DC

### Session Management
- Three session states: 'active', 'completed', 'archived'
- Automatic session state transitions
- History persistence with date tracking
- Single active session limitation

### LocalStorage Keys
- `dnd-players`: Player roster
- `dnd-events`: Skill check events
- `dnd-session-history`: All session history

## Development Notes

- TypeScript strict mode enabled
- ESLint with React hooks and TypeScript support
- No test framework currently configured
- Uses Vite for fast development and building
- All dates stored as Date objects, serialized/deserialized for localStorage