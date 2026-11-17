---
title: Deploying GitHub Projects with Vercel
product: vercel
url: /docs/git/vercel-for-github
canonical_url: "https://vercel.com/docs/git/vercel-for-github"
last_updated: 2026-09-17
type: conceptual
prerequisites:
  - /docs/git
related:
  - /docs/deployments/environments
  - /docs/domains/working-with-domains
  - /docs/git
  - /docs/projects
  - /docs/project-configuration/git-configuration
summary: Vercel for GitHub automatically deploys your GitHub projects with Vercel, providing Preview Deployment URLs, and automatic Custom Domain updates.
install_vercel_plugin: npx plugins add vercel/vercel-plugin
---

# Deploying GitHub Projects with Vercel

Vercel for GitHub automatically deploys your GitHub projects with [Vercel](/), providing [Preview Deployment URLs](/docs/deployments/environments#preview-environment-pre-production#preview-urls), and automatic [Custom Domain](/docs/domains/working-with-domains) updates.


<!-- docsgraph:related -->
## Related pages

> **For AI agents:** Follow these links to understand how this page connects to the rest of the Vercel ecosystem. For the full cross-link map (inbound, outbound, prerequisites, and semantic neighbors), see the .graph.md link below.

- [Consolidated Commit Status now available on GitHub](https://vercel.com/changelog/consolidated-commit-status-now-available-for-github?from=related&source_path=%2Fdocs%2Fgit%2Fvercel-for-github&source_site=vercel-docs&relationship=related)
- [Optionally disable deployment_status webhook events for GitHub Actions](https://vercel.com/changelog/optionally-disable-deployment_status-webhook-events-for-github-actions?from=related&source_path=%2Fdocs%2Fgit%2Fvercel-for-github&source_site=vercel-docs&relationship=related)
- [Trigger GitHub Actions with enriched deployment data from Vercel](https://vercel.com/changelog/trigger-github-actions-with-enriched-deployment-data-from-vercel?from=related&source_path=%2Fdocs%2Fgit%2Fvercel-for-github&source_site=vercel-docs&relationship=related)
- [New GitHub App permissions for Actions and Workflows](https://vercel.com/changelog/vercel-github-app-updated-permissions?from=related&source_path=%2Fdocs%2Fgit%2Fvercel-for-github&source_site=vercel-docs&relationship=related)
- [Migrate self-hosted Next.js and containers from AWS to Vercel](https://vercel.com/kb/guide/migrate-containers-from-aws-to-vercel?from=related&source_path=%2Fdocs%2Fgit%2Fvercel-for-github&source_site=vercel-docs&relationship=related) — Migrate containers from AWS to Vercel: deploy with Dockerfile.vercel, keep RDS, S3, and SQS in AWS over OIDC, and cut ov
- [How to fix “unable to find your GitHub repository” on Vercel](https://vercel.com/kb/guide/unable-to-find-github-repository?from=related&source_path=%2Fdocs%2Fgit%2Fvercel-for-github&source_site=vercel-docs&relationship=related) — Learn how to check GitHub permissions to ensure your Vercel account has sufficient access to import your repository.
- [Using Vercel Agent to review pull requests](https://vercel.com/kb/guide/vercel-agent-code-review?from=related&source_path=%2Fdocs%2Fgit%2Fvercel-for-github&source_site=vercel-docs&relationship=related) — Set up Vercel Agent Code Review to automatically review pull requests, apply validated fixes, request reviews with @verc
- [Introducing `vercel dev`: Serverless, on localhost](https://vercel.com/blog/vercel-dev?from=related&source_path=%2Fdocs%2Fgit%2Fvercel-for-github&source_site=vercel-docs&relationship=related)
- [Deploy to Vercel with Self-Hosted Git Pipelines \\(GitLab & Bitbucket\\)](https://vercel.com/kb/guide/how-can-i-use-gitlab-pipelines-with-vercel?from=related&source_path=%2Fdocs%2Fgit%2Fvercel-for-github&source_site=vercel-docs&relationship=related) — Learn how to use GitLab Pipelines to deploy to Vercel including support for self-managed GitLab.
- [Why aren't commits triggering deployments on Vercel?](https://vercel.com/kb/guide/why-aren-t-commits-triggering-deployments-on-vercel?from=related&source_path=%2Fdocs%2Fgit%2Fvercel-for-github&source_site=vercel-docs&relationship=related) — Commits not triggering deployments on Vercel? Walk the diagnostic checklist covering authentication, commit author acces
- [September 2020](https://vercel.com/blog/changelog-september-2020?from=related&source_path=%2Fdocs%2Fgit%2Fvercel-for-github&source_site=vercel-docs&relationship=related)
- [July 2020](https://vercel.com/blog/changelog-july-2020?from=related&source_path=%2Fdocs%2Fgit%2Fvercel-for-github&source_site=vercel-docs&relationship=related)

Full cross-link map for this page: [/docs/git/vercel-for-github.graph.md](/docs/git/vercel-for-github.graph.md?from=related&source_path=%2Fdocs%2Fgit%2Fvercel-for-github&source_site=vercel-docs&relationship=graph)
<!-- /docsgraph:related -->

## Supported GitHub Products

- [GitHub Free](https://github.com/pricing)
- [GitHub Team](https://github.com/pricing)
- [GitHub Enterprise Cloud](https://docs.github.com/en/get-started/learning-about-github/githubs-products#github-enterprise)
- [GitHub Enterprise Server](#using-github-actions) (When used with GitHub Actions)

> **💡 Note:** When using [Data Residency with a unique subdomain](https://docs.github.com/en/get-started/learning-about-github/githubs-plans#github-enterprise:~:text=The%20option%20to%20host%20your%20company%27s%20data%20in%20a%20specific%20region%2C%20on%20a%20unique%20subdomain) on GitHub Enterprise Cloud you'll need to use [GitHub Actions](#using-github-actions)

## Deploying a GitHub Repository

The [Deploying a Git repository](/docs/git#deploying-a-git-repository) guide outlines how to create a new Vercel Project from a GitHub repository, and enable automatic deployments on every branch push.

## Changing the GitHub Repository of a Project

If you'd like to connect your Vercel Project to a different GitHub repository or disconnect it, you can do so from the [Git section](/docs/projects#git) in the Project Settings.

### A Deployment for Each Push

Vercel for GitHub will **deploy every push by default**. This includes
pushes and pull requests made to branches. This allows those working within the
repository to preview changes made before they are pushed to production.

With each new push, if Vercel is already building a previous commit on the same branch, the current build will complete and any commit pushed during this time will be queued. Once the first build completes, the most recent commit will begin deployment and the other queued builds will be cancelled. This ensures that you always have the latest changes deployed as quickly as possible.

You can disable this feature for GitHub by configuring the [github.autoJobCancellation](/docs/project-configuration/git-configuration#github.autojobcancelation) option in your `vercel.json` file.

### Select Turbo for one deployment

To select a [Turbo build machine](/docs/builds/managing-builds#build-machines) for one deployment, include the exact, case-sensitive marker `#VERCEL_BUILD_MACHINE=TURBO` in the Git commit message. This marker currently supports deployments triggered by Vercel's GitHub integration only. Vercel's GitLab and Bitbucket integrations don't support it.

For example, create a commit with a subject and the marker in its body:

```bash
git commit -m "Test this change with Turbo" \
  -m "#VERCEL_BUILD_MACHINE=TURBO"
```

The marker applies only to the deployment triggered by that commit. It doesn't change the project's build machine settings. You must have permission to update the project's build machine. If Turbo isn't available or you don't have permission, Vercel uses the project's normal build machine selection instead of failing the deployment. Normal Turbo plan eligibility and billing still apply.

### Updating the Production Domain

If [Custom Domains](/docs/domains/working-with-domains/add-a-domain) are set from a project domains dashboard, pushes and merges to the [Production Branch](/docs/git#production-branch) (commonly "main") will be made live to those domains with the latest deployment made with a push.

If you decide to revert a commit that has already been deployed to production, the previous [Production Deployment](/docs/deployments/environments#production-environment) from a commit will automatically be made available at the [Custom Domain](/docs/domains/working-with-domains/add-a-domain) instantly; providing you with instant rollbacks.

### Preview URLs for the Latest Changes for Each Pull Request

The latest push to any pull request will automatically be made available at a unique [preview URL](/docs/deployments/environments#preview-environment-pre-production#preview-urls) based on the project name, branch, and team or username. These URLs will be provided through a comment on each pull request. Vercel also supports Comments on preview deployments made from PRs on GitHub. [Learn more about Comments on preview deployments in GitHub here](/docs/deployments/environments#preview-environment-pre-production#github-integration).

### Deployment Authorizations for Forks

If you receive a pull request from a fork of your repository, Vercel will require authorization from you or a [team member](/docs/rbac/managing-team-members) to deploy the pull request.

This behavior protects you from leaking sensitive project information such as environment variables and the [OIDC Token](/docs/oidc).

You can disable [Git Fork Protection](/docs/projects#git-fork-protection) in the Security section of your Project Settings.

Vercel for GitHub uses the deployment API to bring you an extended user interface both in GitHub, when showing deployments, and Slack, if you have notifications setup using the [Slack GitHub app](https://slack.github.com).

You will see all of your deployments, production or preview, from within GitHub on its own page.

Due to using GitHub's Deployments API, you will also be able to integrate with other services through [GitHub's checks](https://help.github.com/en/articles/about-status-checks). Vercel will provide the deployment URL to the checks that require it, for example; to a testing suite such as [Checkly](https://checklyhq.com/docs/cicd/github/).

### Configuring for GitHub

To configure the Vercel for GitHub integration, see [the configuration reference for Git](/docs/project-configuration/git-configuration).

### System environment variables

You may want to use different workflows and APIs based on Git information. To support this, the following [System Environment Variables](/docs/environment-variables/system-environment-variables) are exposed to your Deployments:

<br />

### `VERCEL`

**Available at:&#x20;**&#x42;oth build and runtime

An indicator to show that system environment variables have been exposed to your project's Deployments.

```bash
VERCEL=1
```

### `CI`

**Available at:&#x20;**&#x42;uild time

An indicator that the code is running in a Continuous Integration environment.

```bash
CI=1
```

### `VERCEL_ENV`

**Available at:&#x20;**&#x42;oth build and runtime

The environment that the app is deployed and running on. The value can be either production, preview, or development.

```bash
VERCEL_ENV=production
```

### `VERCEL_TARGET_ENV`

**Available at:&#x20;**&#x42;oth build and runtime

The system or custom environment that the app is deployed and running on. The value can be either production, preview, development, or the name of a custom environment.

```bash
VERCEL_TARGET_ENV=production
```

### `VERCEL_URL`

**Available at:&#x20;**&#x42;oth build and runtime

The domain name of the generated deployment URL. Example: \*.vercel.app. The value does not include the protocol scheme https://.

**Note:&#x20;**&#x54;his variable cannot be used in conjunction with Standard Deployment Protection. See Migrating to Standard Protection.

```bash
VERCEL_URL=my-site.vercel.app
```

### `VERCEL_BRANCH_URL`

**Available at:&#x20;**&#x42;oth build and runtime

The domain name of the generated Git branch URL. Example: \*-git-\*.vercel.app. The value does not include the protocol scheme https://.

```bash
VERCEL_BRANCH_URL=my-site-git-improve-about-page.vercel.app
```

### `VERCEL_PROJECT_PRODUCTION_URL`

**Available at:&#x20;**&#x42;oth build and runtime

A production domain name of the project. We select the shortest production custom domain, or vercel.app domain if no custom domain is available. Note, that this is always set, even in preview deployments. This is useful to reliably generate links that point to production such as OG-image URLs. The value does not include the protocol scheme https://.

```bash
VERCEL_PROJECT_PRODUCTION_URL=my-site.com
```

### `VERCEL_REGION`

**Available at:&#x20;**&#x52;untime

The ID of the Region where the app is running.

```bash
VERCEL_REGION=cdg1
```

### `VERCEL_DEPLOYMENT_ID`

**Available at:&#x20;**&#x42;oth build and runtime

The unique identifier for the deployment, which can be used to implement Skew Protection.

```bash
VERCEL_DEPLOYMENT_ID=dpl_7Gw5ZMBpQA8h9GF832KGp7nwbuh3
```

### `VERCEL_PROJECT_ID`

**Available at:&#x20;**&#x42;oth build and runtime

The unique identifier for the project.

```bash
VERCEL_PROJECT_ID=prj_Rej9WaMNRbffVm34MfDqa4daCEvZzzE
```

### `VERCEL_SKEW_PROTECTION_ENABLED`

**Available at:&#x20;**&#x42;oth build and runtime

When Skew Protection is enabled in Project Settings, this value is set to 1.

```bash
VERCEL_SKEW_PROTECTION_ENABLED=1
```

### `VERCEL_AUTOMATION_BYPASS_SECRET`

**Available at:&#x20;**&#x42;oth build and runtime

The Protection Bypass for Automation value, if the secret has been generated in the project's Deployment Protection settings.

```bash
VERCEL_AUTOMATION_BYPASS_SECRET=secret
```

### `VERCEL_OIDC_TOKEN`

**Available at:&#x20;**&#x42;uild time

When Secure Backend Access with OpenID Connect (OIDC) Federation is enabled in Project Settings, this value is set to a Vercel-issued OIDC token. At runtime, the token is set to thex-vercel-oidc-token header on your functions' Request object. In local development, you can download the token using the CLI commandvercel env pull.

```bash
VERCEL_OIDC_TOKEN=secret
```

### `VERCEL_HASH_SALT`

**Available at:&#x20;**&#x42;uild time

A salt to rotate the filenames of framework-generated content-addressed output. See also Immutable Static Files.

```bash
VERCEL_HASH_SALT=1783933175
```

### `VERCEL_GIT_PROVIDER`

**Available at:&#x20;**&#x42;oth build and runtime

The Git Provider the deployment is triggered from.

```bash
VERCEL_GIT_PROVIDER=github
```

### `VERCEL_GIT_REPO_SLUG`

**Available at:&#x20;**&#x42;oth build and runtime

The origin repository the deployment is triggered from.

```bash
VERCEL_GIT_REPO_SLUG=my-site
```

### `VERCEL_GIT_REPO_OWNER`

**Available at:&#x20;**&#x42;oth build and runtime

The account that owns the repository the deployment is triggered from.

```bash
VERCEL_GIT_REPO_OWNER=acme
```

### `VERCEL_GIT_REPO_ID`

**Available at:&#x20;**&#x42;oth build and runtime

The ID of the repository the deployment is triggered from.

```bash
VERCEL_GIT_REPO_ID=117716146
```

### `VERCEL_GIT_COMMIT_REF`

**Available at:&#x20;**&#x42;oth build and runtime

The git branch of the commit the deployment was triggered by.

```bash
VERCEL_GIT_COMMIT_REF=improve-about-page
```

### `VERCEL_GIT_COMMIT_SHA`

**Available at:&#x20;**&#x42;oth build and runtime

The git SHA of the commit the deployment was triggered by.

```bash
VERCEL_GIT_COMMIT_SHA=fa1eade47b73733d6312d5abfad33ce9e4068081
```

### `VERCEL_GIT_COMMIT_MESSAGE`

**Available at:&#x20;**&#x42;oth build and runtime

The message attached to the commit the deployment was triggered by. The message is truncated if it exceeds 2048 bytes.

```bash
VERCEL_GIT_COMMIT_MESSAGE=Update about page
```

### `VERCEL_GIT_COMMIT_AUTHOR_LOGIN`

**Available at:&#x20;**&#x42;oth build and runtime

The username attached to the author of the commit that the project was deployed by.

```bash
VERCEL_GIT_COMMIT_AUTHOR_LOGIN=timmytriangle
```

### `VERCEL_GIT_COMMIT_AUTHOR_NAME`

**Available at:&#x20;**&#x42;oth build and runtime

The name attached to the author of the commit that the project was deployed by.

```bash
VERCEL_GIT_COMMIT_AUTHOR_NAME=Timmy Triangle
```

### `VERCEL_GIT_PREVIOUS_SHA`

**Available at:&#x20;**&#x42;uild time

The git SHA of the last successful deployment for the project and branch. It's empty on a branch's first deployment, since that branch has no previous successful deployment yet.

**Note:&#x20;**&#x54;his variable is only exposed when an Ignored Build Step is provided.

```bash
VERCEL_GIT_PREVIOUS_SHA=fa1eade47b73733d6312d5abfad33ce9e4068080
```

### `VERCEL_GIT_PULL_REQUEST_ID`

**Available at:&#x20;**&#x42;oth build and runtime

The pull request id the deployment was triggered by. If a deployment is created on a branch before a pull request is made, this value will be an empty string.

```bash
VERCEL_GIT_PULL_REQUEST_ID=23
```

We require some permissions through our Vercel for GitHub integration. Below are listed the permissions required and a description for what they are used for.

### Repository Permissions

Repository permissions allow us to interact with repositories belonging to or associated with (if permitted) the connected account.

| Permission        | Read | Write | Description                                                                                                               |
| ----------------- | ---- | ----- | ------------------------------------------------------------------------------------------------------------------------- |
| `Administration`  | Y    | Y     | Allows us to create repositories on the user's behalf.                                                                    |
| `Checks`          | Y    | Y     | Allows us to add checks against source code on push.                                                                      |
| `Contents`        | Y    | Y     | Allows us to fetch and write source code for new project templates for the connected user or organization.                |
| `Deployments`     | Y    | Y     | Allows us to synchronize deployment status between GitHub and the Vercel infrastructure.                                  |
| `Pull Requests`   | Y    | Y     | Allows us create deployments for each Pull Request (PR) and comment on those PR's with status updates.                    |
| `Issues`          | Y    | Y     | Allows us to interact with Pull Requests as with the `Pull Requests` permissions due to GitHub requiring both for access. |
| `Metadata`        | Y    | N     | Allows us to read basic repository metadata to provide a detailed dashboard.                                              |
| `Web Hooks`       | Y    | Y     | Allows us to react to various GitHub events.                                                                              |
| `Commit Statuses` | Y    | Y     | Allows us to synchronize commit status between GitHub and Vercel.                                                         |

### Organization Permissions

Organization permissions allow us to offer an enhanced experience through information about the connected organization.

| Permission | Read | Write | Description                                             |
| ---------- | ---- | ----- | ------------------------------------------------------- |
| `Members`  | Y    | N     | Allows us to offer a better team onboarding experience. |

### User Permissions

User permissions allow us to offer an enhanced experience through information about the connected user.

| Permission        | Read | Write | Description                                            |
| ----------------- | ---- | ----- | ------------------------------------------------------ |
| `Email addresses` | Y    | N     | Allows us to associate an email with a GitHub account. |

> **💡 Note:** We use the permissions above to provide you with the best possible
> deployment experience. If you have any questions or concerns about any of the
> permission scopes, please [contact Vercel Support](/help#issues).

To sign up on Vercel with a different GitHub account, sign out of your current GitHub account.

Then, restart the Vercel [signup process](/signup).

## Missing Git repository

When you create a new project from a GitHub repository or connect an existing project to one, you need specific permissions. The required permissions depend on whether a personal GitHub account or a GitHub organization [owns the repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/about-repositories#about-repository-ownership).

### Personal account repositories

To import or connect a GitHub repository owned by a [personal account](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/permission-levels-for-a-personal-account-repository), you must be the repository **Owner**. This allows Vercel to configure a webhook and automatically deploy your commits. A Collaborator on a personal repository cannot create new Vercel projects from that repository or connect it to existing projects.

### Organization repositories

If an organization owns the repository, you need one of the following permissions to import or connect a GitHub repository:

- **Owner** of the GitHub organization

**OR**

- **Member** of the GitHub organization *with access to the repository*. If you are a Member of the organization and do not see the repository as an option in Vercel, verify that you have an [access role](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization#repository-roles-for-organizations) to the repository in addition to being an organization Member.

If you have access to the repository but are only an [Outside Collaborator in the GitHub organization](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-outside-collaborators/adding-outside-collaborators-to-repositories-in-your-organization), you cannot import or connect a GitHub repository in Vercel. You need to be an Owner or a Member of the GitHub organization.

Contact your GitHub organization's Owner(s) to confirm your current role and repository-level access.

## Silence GitHub comments

By default, comments from the Vercel GitHub bot will appear on your pull requests and commits. You can disable these comments while continuing to create preview deployments. To silence comments for your project:

1. From the Vercel [dashboard](/dashboard), select your project
2. From the **Settings** tab, select **Git**
3. Under **Connected Git Repository**, toggle the switches to your preference

If you had previously used the, now deprecated, [`github.silent`](/docs/project-configuration/git-configuration#github.silent) property in your project configuration, we'll automatically adjust the setting for you.

> **💡 Note:** It is currently not possible to prevent comments for specific branches.

## Commit status

By default, git commits will receive a [GitHub Commit Status](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks#types-of-status-checks-on-github) for each project deployed by a commit. These
statuses indicates whether the commit successfully deployed or failed, or skipped its Vercel deployment.

Monorepos can enable a consolidated commit status to reduce noise on their pull requests and commits.
When projects are included in the consolidated commit status, they can also be configured as
soft failures, so they do not block merges or fail the commit. This is useful for projects that are temporarily
failing to deploy, so they do not block the rest of the team.

Configure the individual and consolidated commit status by going to the [Git settings](https://vercel.com/d?to=%2F%5Bteam%5D%2F%5Bproject%5D%2Fsettings%2Fgit%23git-commits) for your project

## Silence deployment notifications on pull requests

By default, Vercel notifies GitHub of deployments using [the `deployment_status` webhook event](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#deployment_status). This creates an entry in the activity log of GitHub's pull request UI.

Because Vercel also adds a comment to the pull request with a link to the deployment, unwanted noise can accumulate from the list of deployment notifications added to a pull request.

You can disable `deployment_status` events by:

- [Going to the Git settings for your project](https://vercel.com/d?to=%2F%5Bteam%5D%2F%5Bproject%5D%2Fsettings%2Fgit\&title=Project+Git+settings)
- Disabling the `deployment_status` Events toggle

> **💡 Note:** Before doing this, ensure that you aren't depending on `deployment_status`
> events in your GitHub Actions workflows. If you are, we encourage [migrating
> to `repository_dispatch` events](#migrating-from-deployment_status).

## Using GitHub Actions

You can use GitHub Actions to build and deploy your Vercel Application. This approach is necessary to enable Vercel with GitHub Enterprise Server (GHES) with Vercel, as GHES cannot use Vercel’s built-in Git integration.

1. Create a GitHub Action to build your project and deploy it to Vercel. Make sure to install the Vercel CLI (`npm install --global vercel@latest`) and pull your environment variables. For preview deployments use `vercel pull --yes --environment=preview --token=${{ secrets.VERCEL_TOKEN }}`; for production use `vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}`.
2. Use `vercel build` to build your project inside GitHub Actions, without exposing your source code to Vercel. For production builds, pass `--prod`: `vercel build --prod`.
3. Then use `vercel deploy --prebuilt` to skip the build step on Vercel and upload the previously generated `.vercel/output` folder from your GitHub Action to Vercel. For production deploys, pass `--prod`: `vercel deploy --prebuilt --prod`.

You'll need separate GitHub Actions for preview (non-`main` pushes) and production (`main` pushes) deployments. The preview workflow uses `vercel build` and `vercel deploy --prebuilt`; the production workflow uses `vercel build --prod` and `vercel deploy --prebuilt --prod`. [Learn more about how to configure GitHub Actions and Vercel](/kb/guide/how-can-i-use-github-actions-with-vercel) for custom CI/CD workflows.

### Repository dispatch events

> **💡 Note:** This event will only trigger a workflow run if the workflow file exists on the
> default branch (e.g. `main`). If you'd like to test the workflow prior to
> merging to `main`, we recommend adding a [`workflow_dispatch`
> trigger](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#workflow_dispatch).

Vercel sends [`repository_dispatch` events](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#repository_dispatch) to GitHub when the status of your deployment changes. These events can trigger GitHub Actions, enabling continuous integration tasks dependent on Vercel deployments.

GitHub Actions can trigger on the following events:

```yaml
on:
  repository_dispatch:
    - 'vercel.deployment.ready'
    - 'vercel.deployment.success'
    - 'vercel.deployment.error'
    - 'vercel.deployment.canceled'
    # canceled as a result of the ignored build script
    - 'vercel.deployment.ignored'
    # canceled as a result of automatic deployment skipping https://vercel.com/docs/monorepos#skipping-unaffected-projects
    - 'vercel.deployment.skipped'
    - 'vercel.deployment.pending'
    - 'vercel.deployment.failed'
    - 'vercel.deployment.promoted'
```

`repository_dispatch` events contain a JSON payload with information about the deployment, such as deployment `url` and deployment `environment`. GitHub Actions can access this payload through `github.event.client_payload`. For example, accessing the URL of your triggering deployment through `github.event.client_payload.url`.

Read more and see the [full schema](https://github.com/vercel/repository-dispatch/blob/main/packages/repository-dispatch/src/types.ts) in [our `repository-dispatch` package](https://github.com/vercel/repository-dispatch), and see the [how can I run end-to-end tests after my Vercel preview deployment?](/kb/guide/how-can-i-run-end-to-end-tests-after-my-vercel-preview-deployment) guide for a practical example.

#### Migrating from `deployment_status`

With `repository_dispatch`, the dispatch event `client_payload` contains details about your deployment allowing you to reduce GitHub Actions costs and complexity in your workflows.

For example, to migrate the GitHub Actions trigger for preview deployments for end-to-end tests:

Previously, we needed to check if the status of a deployment was successful. Now, with `repository_dispatch` we can trigger our workflow only on a successful deployment by specifying the `'vercel.deployment.success'` dispatch type.

Since we're no longer using the `deployment_status` event, we need to get the `url` from the `vercel.deployment.success` event's `client_payload`.

```diff
name: End to End Tests

on:
- deployment_status:
+ repository_dispatch:
+   types:
+    - 'vercel.deployment.success'
jobs:
  run-e2es:
-   if: github.event_name == 'deployment_status' && github.event.deployment_status.state == 'success'
+   if: github.event_name == 'repository_dispatch'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - name: Install dependencies
        run: npm ci && npx playwright install --with-deps
      - name: Run tests
        run: npx playwright test
        env:
-         BASE_URL: ${{ github.event.deployment_status.environment_url }}
+         BASE_URL: ${{ github.event.client_payload.url }}
```


---

[View full sitemap](/docs/sitemap)