# Velclaw AI Code Review + Auto-Fix

Velclaw now uses two automation layers around pull requests.

## Layer 1 — Code Review

The workflow invokes the pinned \`zskbot/ChatGPT-CodeReview\` action on \`opened\`, \`reopened\`, and \`synchronize\` events.

Review scope:
- correctness and regressions
- security and authorization mistakes
- data-loss risks
- maintainability
- actionable findings only

The review output is captured as an artifact and passed to Layer 2.

## Layer 2 — Auto-Fix + Approval

For pull requests whose head repository is \`Velclaw/VELCLAW\`:

1. install the existing pnpm toolchain
2. run \`type-check\`, \`lint\`, \`test\`, and \`build\`
3. if a check fails, ask GitHub Models for the smallest safe unified-diff fix
4. reject patches that touch workflows, dependency manifests, lockfiles, env files, Dockerfiles, or generated assets
5. apply the patch and rerun all checks
6. run a post-fix AI review
7. push the validated fix to the PR branch
8. approve the PR only when the post-fix review and validation gate are clean

Fork pull requests remain review-only. They do not receive write credentials or automatic code changes.

## Required GitHub Actions permissions

The workflow declares the minimum job permissions:

- review: \`contents: read\`, \`pull-requests: write\`, \`models: read\`
- auto-fix: \`contents: write\`, \`pull-requests: write\`, \`checks: read\`, \`models: read\`
- approval: \`pull-requests: write\`

GitHub Actions must also be allowed to create and approve pull requests in repository Actions settings. A workflow file cannot override that repository-level policy.

If repository or organization policy prevents Actions from approving pull requests, the automation stops at the approval gate instead of bypassing the policy.

## Security boundary

Auto-fix is intentionally limited to same-repository branches. Untrusted fork code is never executed with write credentials.

The AI patch surface excludes:
- \`.github/\`
- dependency manifests and lockfiles
- env/secret files
- Dockerfiles
- generated assets

Branch protection and required status checks should remain enabled. This automation is an additional gate, not a replacement for repository protection.
