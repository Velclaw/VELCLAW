# Managing agent sessions

Monitor an agent's progress, guide it with follow-up prompts, and stop, archive, share, or search sessions across GitHub clients.

> This guide describes GitHub Copilot session features. Availability can vary by client, agent type, and organization policy. Check the linked GitHub documentation for current requirements.

## Monitor agent activity

Open the agents panel on GitHub or go to [github.com/copilot](https://github.com/copilot). Sessions you started, as well as sessions another user prompted Copilot to work on in a repository you can access, appear in your sessions list.

Open a session to review its log and overview. Depending on the session, you can monitor the agent's progress, token usage, and session length.

## Review session logs

Session logs show the agent's interaction history and the tools it used to understand the repository, make changes, and validate its work. Cloud agents work in an isolated development environment and can run automated tests and linters before pushing changes.

Review logs and file changes before accepting an agent's work. Treat prompts, tool output, and repository content as potentially sensitive information.

## Trace commits to session logs

Commits from GitHub Copilot cloud agent are authored by Copilot, with the person who started the task listed as co-author. Commit messages can include a link to the session logs, helping you understand why a change was made during code review or an audit. GitHub displays signed commits as verified.

## Steer an agent session

If the agent is heading in the wrong direction or your original prompt needs adjusting, send a follow-up prompt without stopping the session.

1. Open [your Copilot home page](https://github.com/copilot) and select the session.
2. In the prompt box below the session log, enter your follow-up. For example:

   ```text
   Use our existing ErrorHandler utility class instead of writing custom try-catch blocks for each endpoint.
   ```

3. Press <kbd>Enter</kbd>. The agent applies your input after it finishes its current tool call.

Steering may consume AI credits and may not be available for third-party coding agents. Check your plan and the agent's documentation for details.

## Continue a session from another client

Cloud-sandbox sessions aren't tied to the device or client where you started them. The session, its files, and in-progress work live in GitHub-hosted infrastructure. You can move between clients without copying files, reinstalling dependencies, or repeating the task. See [About cloud sandboxes](https://docs.github.com/en/copilot/concepts/security-governance-and-network-settings/about-cloud-sandboxes#continue-sessions-across-clients).

For example, you can start a session in the GitHub Copilot app, steer it from GitHub Mobile, review it in a browser, then resume it in Copilot CLI. The session history and work remain available as you switch clients, subject to client support and account access.

### Find your sessions in each client

- **GitHub.com:** Go to [github.com/copilot](https://github.com/copilot). Recent sessions appear under **Pick up where you left off**; select **View all** to see more.
- **GitHub Mobile:** Open Copilot and find your sessions under **Agent sessions**.
- **Copilot CLI:** Open the **Sessions** tab or enter `/resume` in an interactive session. Cloud sessions can appear alongside local sessions. See [Work with multiple sessions](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli/work-with-multiple-sessions).
- **GitHub Copilot app:** Select a session in the sidebar.

## Stop a session

If the task is no longer needed or you want to start over with a new prompt, select **Stop session** in the session log viewer. Stopping a session ends the associated Actions run and preserves commits that were already pushed.

## Archive sessions

Archive stopped sessions to remove them from your sessions list.

1. Open the stopped session.
2. Select **More actions** (the kebab menu), then **Archive session**.
3. Confirm by selecting **Yes, archive**.

Cloud-agent sessions can be archived but not deleted. Local sessions from Copilot CLI, VS Code, JetBrains, or the GitHub Copilot app may support deletion. See [Session data](https://docs.github.com/en/copilot/concepts/security-governance-and-network-settings/session-data#deleting-session-data) for details.

## Share a session

Copilot cloud-agent sessions are shared by default. They appear in the repository's **Agents** tab under **All sessions**, where people with repository access can view them.

Local sessions are unshared by default. You can share a local session from the repository's **Agents** tab to give collaborators view-only access. Use the session menu's sharing controls to share or unshare it.

Recipients can view prompts, responses, and file changes, but cannot steer or modify the session. Shared local sessions may not be included in other users' session-history queries.

For more information, see [Session syncing](https://docs.github.com/en/copilot/concepts/security-governance-and-network-settings/session-data#session-syncing).

## Query past sessions

You can ask natural-language questions about your session history in Copilot Chat in VS Code, JetBrains, the GitHub Copilot app, or GitHub.com. Copilot can search your synced sessions from Copilot CLI, cloud agent, and code review to answer questions.

You can query only sessions you started. Session data is private by default; sharing an individual session provides collaborators with view-only access.

### Prerequisites

Your sessions must be synced to your GitHub account. Session data syncs automatically by default. Querying isn't available if you opted out by setting `"remoteExport": false` in your CLI settings JSON, or if your organization hasn't enabled the **Store local sessions in the Cloud** policy. See [Session syncing](https://docs.github.com/en/copilot/concepts/security-governance-and-network-settings/session-data#session-syncing).

### Example queries

```text
What agent tasks did I run last week?
```

```text
Find the session where I refactored authentication.
```

```text
Have I worked on anything related to the payments API?
```

```text
Show me sessions where the agent struggled or I had to correct it multiple times.
```

Copilot can search across your prompts, responses, file changes, and other context from synced sessions.

For CLI-specific querying and `/chronicle` commands, see [Chronicle](https://docs.github.com/en/copilot/how-tos/copilot-cli/use-copilot-cli/chronicle). For conceptual information about session storage and syncing, see [Session data](https://docs.github.com/en/copilot/concepts/security-governance-and-network-settings/session-data).

## Further reading

- [Get the best results with Copilot cloud agent](https://docs.github.com/en/copilot/tutorials/cloud-agent/get-the-best-results)
