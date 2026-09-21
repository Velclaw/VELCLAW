# Integration contract

Velclaw integrations must execute through the existing sandbox/runner, never place credentials in command arguments or committed source, and return normalized results for the review gate.

Current adapters: Ollama local agent and Gito AI review.

Next: GitHub PR gating using the normalized review result.