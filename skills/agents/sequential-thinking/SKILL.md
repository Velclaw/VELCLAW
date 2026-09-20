---
name: sequential-thinking
description: "Structured sequential problem-solving with branching, revision, and adaptive depth. Use for complex planning, analysis, debugging, and multi-step implementation."
---

# Sequential Thinking

Use this skill as a structured planning aid. It maintains numbered reasoning state, supports revisions and branches, and persists only the explicit state submitted to the script.

## Workflow

1. Reset state at the start of a new session.
2. Submit one concise reasoning state at a time.
3. Revise or branch when assumptions change.
4. Stop when the plan or analysis is complete.
5. Keep private chain-of-thought out of user-facing responses.

## Script

Run from this skill directory:

```bash
bun scripts/think.ts --reset
bun scripts/think.ts --thought "..." --thoughtNumber 1 --totalThoughts 3 --nextThoughtNeeded true
bun scripts/think.ts --status
```

The implementation is adapted from `zskbot/sequential-thinking-skill`.
