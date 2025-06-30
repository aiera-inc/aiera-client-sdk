# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Development
- `npm start` - Build and watch files with live reload (serves on localhost:8000)
- `npm run build` - Full production build with clean, codegen, and packaging
- `npm run build:watch` - Development build with watch mode and testing
- `npm run build:docs` - Generate TypeDoc documentation
- `npm run clean` - Clean dist directory
- `npm run codegen` - Run GraphQL code generation

### Testing
- `npm test` - Run Jest tests with coverage
- `npm test:watch` - Run tests in watch mode
- Test files are located alongside source files with `.test.tsx` or `.test.ts` extensions

### Linting and Quality
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run pre-commit` - Run type checking, linting, and tests (used by Husky)

### Code Generation
- `npm run new` - Interactive component/module generator using Plop
- `npm run new:component` - Generate new component
- `npm run new:module` - Generate new module
- `npm run new:svg` - Generate new SVG component
- `npm run new:hook` - Generate new custom hook

## Architecture Overview

### Core Structure
This is the Aiera Client SDK - a React-based widget library for embedding Aiera's financial data functionality into external applications. The SDK is platform-agnostic and uses a messaging system for cross-platform integration.

### Key Architectural Patterns

**Provider Pattern**: The SDK uses a nested provider architecture:
- `ConfigProvider` - Global configuration and environment settings
- `ClientProvider` - GraphQL client setup with URQL
- `MessageBusProvider` - Cross-platform messaging system
- `RealtimeProvider` - Real-time data connections (Pusher/Ably)
- `StorageProvider` - Storage abstraction layer

**Module-Based Architecture**: Each major feature is organized as a self-contained module in `src/modules/`:
- `AieraChat` - AI chat interface with real-time messaging
- `Aieracast` - Audio/video streaming
- `EventList` - Financial events listing
- `Transcript` - Earnings call transcripts
- `RecordingForm` - Call recording setup
- Each module has its own components, services, and store

**Component Architecture**: 
- Components in `src/components/` are reusable across modules
- Each component has: `index.tsx`, `styles.css`, `test.tsx`
- SVG icons are React components in `src/components/Svg/`

### State Management
- Zustand for client-side state (see `src/modules/AieraChat/store.ts`)
- URQL with GraphCache for GraphQL state management
- Custom hooks pattern for encapsulating business logic

### Real-time Features
- Ably integration for chat sessions and live updates
- Pusher support for legacy real-time connections
- Custom WebSocket abstractions in `src/lib/realtime/`

### Build System
- Custom esbuild-based build system in `src/build/index.ts`
- PostCSS processing with Tailwind CSS
- TypeScript with strict mode enabled
- GraphQL codegen for type safety

### Module Types
The SDK supports these embeddable modules:
- `Aieracast` - Audio/video player
- `AieraChat` - AI-powered chat interface  
- `ASR` - Automatic speech recognition
- `EventList` - Financial events
- `NewsList` - News articles
- `Transcrippet` - Real-time transcription
- `Transcript` - Earnings transcripts

### Configuration System
Configuration is handled through the `Config` interface:
- Environment-specific settings via `.env` files
- Module-specific options in `Config.options`
- Platform detection (OpenFin, Glue42, FDC3, etc.)
- Asset path management for embedded contexts

### Testing Strategy
- Jest with React Testing Library
- Tests co-located with source files
- Custom test utilities in `src/testUtils.tsx`
- Coverage reporting enabled

### Development Workflow
1. Use `npm start` for development with hot reload
2. Access demos at `localhost:8000/demo/[ModuleName].html`
3. GraphQL schema changes require running `npm run codegen`
4. Use Plop generators for consistent file structure
5. All changes go through linting and testing via Husky pre-commit hooks

### Key Files for Understanding
- `src/api/client.tsx` - GraphQL client setup with caching
- `src/components/Provider/index.tsx` - Main provider composition
- `src/lib/config/index.tsx` - Configuration system
- `src/web/embed.ts` - Web embedding logic
- `templates/plopfile.ts` - Code generation templates