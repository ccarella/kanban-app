# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Kanban board application built with Next.js 15, TypeScript, and Redis (via Upstash). The app uses React 19 with the Next.js App Router and implements drag-and-drop functionality for task management.

## Commands

```bash
# Development
npm run dev         # Start development server with Turbopack

# Build & Production
npm run build       # Build for production
npm run start       # Start production server

# Code Quality
npm run lint        # Run ESLint
```

## Architecture

### Data Flow
1. **Client State**: Uses React `useState` for local board state management
2. **Server Actions**: Next.js server actions handle Redis operations (e.g., `moveCard` in `app/actions.ts`)
3. **Optimistic Updates**: Uses `useTransition` for immediate UI feedback before server confirmation
4. **Persistence**: Redis stores board data with structured keys

### Redis Key Structure
```
boards:${boardId}           # Board metadata
boards:${boardId}:columns   # List of column IDs
columns:${columnId}         # Column metadata
columns:${columnId}:cards   # List of card IDs
cards:${cardId}            # Individual card data
```

### Component Hierarchy
- **Server Components**: Handle data fetching (pages)
- **Client Components**: Handle interactivity (`BoardClient`, `KanbanColumn`, `KanbanCard`)
- **UI Primitives**: Reusable components in `src/components/ui/`

### Key Patterns
- **Drag & Drop**: Native HTML5 drag-and-drop API
- **Type Safety**: Comprehensive TypeScript interfaces (`KanbanItem`, `BoardState`)
- **Styling**: Tailwind CSS v4 with glass-morphism design
- **Dark Mode**: Tokyo Night-inspired dark theme as default, using CSS variables
- **Error Handling**: Redis client checks for availability before operations

## Environment Setup

Requires environment variables for Redis connection:
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## Tech Stack
- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript 5
- **UI**: React 19, Radix UI, Lucide Icons
- **Styling**: Tailwind CSS v4
- **Database**: Redis (Upstash)
- **Build**: Turbopack (dev), Webpack (production)