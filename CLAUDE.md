# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a TanStack Router-based React application built with Vite, TypeScript, and Tailwind CSS. The project serves as a code library viewer with Discord theme hosting capabilities, deployed to GitHub Pages.

## Development Commands

```bash
# Install dependencies
bun install

# Start development server (runs on port 3000)
bun --bun run dev

# Build for production (includes TypeScript compilation and 404.html generation)
bun run build

# Preview production build
bun run serve

# Run tests
bun --bun run test

# Lint code
bun run lint

# Format code with Prettier
bun run format

# Format and lint with auto-fix
bun run check
```

## Project Architecture

### Routing System

- **File-based routing**: TanStack Router manages routes as files in `src/routes/`
- **Root layout**: `src/routes/__root.tsx` provides the application shell with sidebar navigation
- **Route generation**: Routes are auto-generated into `src/routeTree.gen.ts` by the TanStack Router plugin
- New routes automatically generate when you create files in `src/routes/`

### Virtual Module System

The project uses a custom Vite plugin (`codeLibraryManifestPlugin`) that:
- Scans the `public/` directory at build time
- Generates a virtual module `virtual:code-library` containing file metadata
- Provides manifest data including file paths, sizes, and modification times
- Auto-reloads during development when public files change

This powers the code library viewer functionality by exposing `public/` directory contents to the application.

### Library Metadata System

- `src/lib/library.ts`: Consumes the virtual module manifest and enriches it with metadata
- `src/data/library-metadata.ts`: Contains display metadata (titles, descriptions, language labels) for assets and folders
- The system organizes files into hierarchical folder groups for navigation

### Code Viewer Component

`src/components/code-file-viewer.tsx`:
- Uses Shiki for syntax highlighting with theme support
- Dynamically imports Shiki to avoid bundle bloat
- Adapts to light/dark mode from the theme provider
- Supports copying code and raw file URLs
- Extracts background/foreground colors from Shiki output for seamless integration

### Theme System

- `src/components/theme-provider.tsx`: Provides dark/light/system theme context
- Theme preference persisted to localStorage with key `vite-ui-theme`
- Mode toggle component available at `src/components/mode-toggle.tsx`

### UI Components

- Located in `src/components/ui/`
- Uses Radix UI primitives with custom styling
- Tailwind CSS v4 for styling
- Class variance authority (CVA) for component variants
- `cn()` utility from `src/lib/utils.ts` merges Tailwind classes

### Build Process

The build script runs three steps sequentially:
1. `vite build` - Bundles the application
2. `tsc` - Type checks the codebase
3. `node scripts/copy-404.mjs` - Copies `dist/index.html` to `dist/404.html` for GitHub Pages client-side routing support

### Deployment

- Deploys to GitHub Pages via `.github/workflows/deploy.yml`
- Triggered on pushes to `master` branch
- Uses Bun for dependency installation and building
- Artifacts uploaded from `./dist` directory

## Working with Routes

When adding new routes:
1. Create a new `.tsx` file in `src/routes/`
2. Use `createFileRoute()` to define the route
3. TanStack Router will auto-generate the route configuration
4. Add navigation links using `<Link to="/route-path">` from `@tanstack/react-router`

Example route structure:
```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/your-route')({
  component: YourComponent,
})

function YourComponent() {
  return <div>Your content</div>
}
```

## Discord Themes

The `/discord-themes` route demonstrates the code library viewer:
- Fetches files from `public/discord/themes/`
- Uses the library system to organize and display theme files
- Renders CSS files with syntax highlighting
- Provides copy and download functionality

## Path Aliases

The `@/` alias resolves to `./src/` for cleaner imports:
```tsx
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
```

## Testing

- Vitest configured with jsdom environment
- React Testing Library available for component tests
- Tests run in globals mode (no need to import `describe`, `it`, `expect`)
