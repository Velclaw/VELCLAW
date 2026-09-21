# AgentsIDE architecture

## Current layer
- React + TypeScript + Vite shell
- Mobile-first navigation
- Monaco editor surface
- Workspace file explorer

## Next layers
1. Workspace filesystem adapter
2. Agent task executor
3. Diff/review engine
4. Test runner and terminal
5. GitHub branch/commit/PR adapter
6. Deployment gate

The UI is intentionally separated from execution so local workspace actions and remote GitHub actions can be added without coupling them to navigation.
