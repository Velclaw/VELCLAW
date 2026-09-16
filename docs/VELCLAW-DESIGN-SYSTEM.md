# Velclaw Design System

## Product model
Velclaw is an AI-native software lifecycle workspace. The UI is organized around three verbs: **Build → Run → Understand**.

## Sitemap
- Home
- Console: Dashboard, Workspace, Projects, Agents, Code Space, Environments, Deployments, Logs, Settings
- Platform: Architecture, Runtime, Workspace, Project Model, Agent Model
- Build: Code Space, Repositories, Branches, Packages, Environments
- Automate: Workflows, Jobs, Triggers, Schedules
- Deploy: Builds, Deployments, Releases, Rollbacks
- Integrate: API, SDK, Webhooks, Integrations
- Secure: Authentication, Access, Secrets, Audit
- Observe: Logs, Metrics, Events, Diagnostics
- Docs: Start, Guides, Tutorials, Concepts, Reference
- Developers: CLI, API Reference, SDK Reference, Extensions, Examples
- Community: Discussions, Contributing, Extensions, Changelog

## Foundation
### Brand
- Primary mark: minimal geometric V.
- V-Core: primary brand mark.
- V-Motion: runtime/loading state.
- V-Mono: terminal/CLI mark.
- Do not use literal wolf artwork as the primary identity.

### Tokens
- Background: #08090B
- Surface: #0F1115
- Surface elevated: #151820
- Border: #262A33
- Text primary: #F4F6F8
- Text secondary: #A7ADB8
- Text muted: #6D7480
- Accent: #C7FF4A
- Success: #5BE39B
- Warning: #FFC857
- Danger: #FF6B6B
- Info: #72B7FF

### Typography
- UI/display: Inter or Geist
- Code: JetBrains Mono
- Display 48–72px; H1 36–48px; H2 28–32px; H3 20–24px; body 14–16px; caption 12–13px; code 12–14px.

### Layout
- Desktop max content width: 1440px.
- Sidebar: 240px.
- Page gutters: 32px desktop, 20px mobile.
- Base spacing unit: 4px.
- Radius: 10px controls, 14px cards, 18px panels.
- Responsive breakpoints: 640 / 768 / 1024 / 1280 / 1536.

### Motion
- Fast UI transitions: 120–180ms.
- Panels/modals: 180–240ms.
- Runtime status transitions may use subtle 800–1200ms loops.
- Always respect prefers-reduced-motion.

## Core components
Navigation, TopBar, Sidebar, Breadcrumb, Tabs, CommandPalette, Button, Input, Select, Combobox, Toggle, Card, DataTable, CodeBlock, Terminal, LogViewer, DiffViewer, StatusIndicator, Badge, Metric, AgentCard, WorkflowNode, DeploymentCard, ActivityStream, Modal, Drawer, Toast, Skeleton, EmptyState, ErrorState.

## Core screen contracts
- Home: explain product, establish V identity, route users into Build/Run/Docs.
- Docs: searchable technical knowledge with persistent section navigation.
- Console: workspace health and recent activity at a glance.
- Project: code, agents, automations, deployments and settings in one project context.
- Agent: identity, runtime, capabilities, current execution and activity.
- Code Space: file tree, editor, terminal and preview.
- Workflow: graph-first orchestration with execution state.
- Deployment: release status, environment, logs, rollback.
- API: endpoint explorer, authentication, request/response examples.

## System states
Every major resource must define loading, empty, error, disabled, permission-denied and success states. Avoid decorative states that hide actionable diagnostics.

## Accessibility
Keyboard-first navigation, visible focus, semantic landmarks, accessible names, minimum AA contrast, reduced motion, and status announcements for asynchronous runtime changes.
