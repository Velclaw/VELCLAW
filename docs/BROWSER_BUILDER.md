# Velclaw Browser Builder

Velclaw Browser Builder is the phone-first development surface. The browser owns the interactive workspace; Android does not run a local server, Docker daemon, CI runner, or persistent project storage.

## Runtime model

- Browser workspace: files, editor, terminal output and preview.
- WebContainer runtime: Node.js-compatible development environment inside the browser.
- Velclaw backend: authentication, GitHub integration, agent orchestration and publish/deployment APIs.
- Remote hosting: only used for workloads that cannot run safely inside the browser runtime.

This follows the same architectural direction as Bolt.new, which uses WebContainers for browser-side development environments. Velclaw remains its own product and codebase.
