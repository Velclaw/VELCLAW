# Velclaw Builder implementation

## Runtime

`@webcontainer/api` provides the browser-local Node.js-compatible filesystem and process runtime. The Builder mounts project files, installs dependencies, runs terminal commands, starts the development server and attaches the `server-ready` URL to the live preview.

## Agent layer

The backend exposes four Velclaw roles:

- **Coder** — changes the browser workspace through a constrained file-change tool.
- **Reviewer** — audits correctness, security, accessibility and maintainability.
- **Tester** — produces exact verification commands and identifies likely build/type/test failures without falsely claiming execution.
- **Deployer** — evaluates deployment readiness and configuration.

The autonomous workflow endpoint runs Coder → Tester → Reviewer against the same evolving workspace.

## GitHub layer

Authenticated users can import a repository branch into the Builder. Publishing creates a dedicated branch, Git tree, commit and pull request using the connected GitHub account.

The server enforces file-count, file-size, total-workspace and unsafe-path limits. Generated dependencies and build directories are excluded from import.

## Browser terminal

Commands execute in WebContainer rather than on Android or the Velclaw server. The Builder blocks a small set of destructive host-style command patterns and caps command length. WebContainer remains the security boundary for browser-local development.

## Persistence

The current interactive workspace is persisted locally in browser storage so closing/reopening the Builder does not require a phone-side server. GitHub is the durable source-control path when the user publishes changes.

## Deployment

Builder publishing can queue a repository deployment through the existing `/api/deployments` and Velclaw Hosting abstraction. Production runtime/DNS remains a separate infrastructure concern and is not silently claimed as deployed by Builder.
