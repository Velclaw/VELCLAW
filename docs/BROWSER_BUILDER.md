# Velclaw Builder

Velclaw Builder is the browser-first development product inside the Velclaw platform. WebContainer is an implementation technology, not the product identity.

## Product boundary

- **Velclaw Builder** owns the UI, workspace, project model and lifecycle.
- **Velclaw Agents** own coding, review, testing and deployment reasoning.
- **WebContainer** provides the in-browser Node.js-compatible runtime.
- **GitHub** provides repository import, branches, commits and pull requests.
- **Velclaw Review** owns code-quality and security review workflows.
- **Velclaw API** owns authenticated backend operations.
- **Velclaw Hosting / Deploy** owns remote builds and production runtime.
- **Velclaw Hub / Docs** provide project knowledge and documentation context.

## Phone architecture

The phone is a browser client. It does not need Termux, Docker, a local database, a CI runner, or a persistent project server for Builder use.

```text
VELCLAW BUILDER
      |
      +-- Velclaw Agents
      |     +-- Coder
      |     +-- Reviewer
      |     +-- Tester
      |     +-- Deployer
      |
      +-- WebContainer
      |     +-- Node.js/npm
      |     +-- terminal
      |     +-- live preview
      |
      +-- GitHub
      |     +-- import
      |     +-- branch
      |     +-- commit
      |     +-- PR
      |
      +-- Velclaw Hosting / Deploy
            +-- build
            +-- runtime
            +-- routing
```

The browser runtime pattern is inspired by browser-based Node development systems such as Bolt.new, but Velclaw Builder remains a separate product with its own agents, project lifecycle, GitHub integration, review layer and deployment system.
