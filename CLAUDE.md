# Retro RSS Reader Development Guide

## Build and Development Commands
- Development server: `npm run dev`
- Build project: `npm run build`
- Start production build: `npm run start`
- Lint code: `npm run lint`

## Code Style Guidelines
- **TypeScript**: Use strict typing. Define interfaces in `types.ts` for shared types.
- **Components**: Use functional components with React hooks. Add "use client" directive for client components.
- **Imports**: Group imports by: 1) React/Next.js, 2) External libraries, 3) Components, 4) Types/Utils.
- **Error Handling**: Use try/catch blocks with specific error messages. Display user-friendly errors in UI.
- **State Management**: Use React hooks (useState, useEffect) for component state.
- **Component Props**: Define explicit prop interfaces for all components.
- **CSS**: Use Tailwind utility classes for styling. Follow mobile-first responsive design.
- **Naming**: Use PascalCase for components, camelCase for variables/functions, and kebab-case for files.
- **Async Functions**: Always handle loading states and errors for async operations.

This file serves as a guide for Claude and other AI assistants when working with this codebase.