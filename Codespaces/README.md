# GitHub Codespaces billing

Learn about the costs for using GitHub Codespaces, and the monthly usage quotas included with GitHub personal accounts.

## How use of GitHub Codespaces is measured

A GitHub Codespaces instance (a "codespace") incurs two types of charges.

* **Compute time**: processing time and power, while the codespace is active.
* **Storage**: amount of disk space the codespace or prebuild occupies, while it exists.

In addition, any prebuilt codespaces are generated using actions minutes, see [About GitHub Codespaces prebuilds](/en/codespaces/prebuilding-your-codespaces/about-github-codespaces-prebuilds).

### Compute time

The compute time for a codespace is the length of time for which that codespace is active. Total use of compute time for each processor type is calculated by summing the time used by all codespaces billable to a particular account. These totals are reported to the billing service every hour, and are billed monthly.

* **Compute time:** Your included compute hours reset to the full amount at the start of each billing cycle. Compute usage is charged to the account that owns the codespace.
* **Storage:** Storage charges accumulate throughout the month based on hourly usage. Your accrued storage charges reset to zero at the start of each billing cycle.

For more information about billing cycles, see [Billing cycles](/en/billing/concepts/billing-cycles).

### Storage volume for codespaces

Storage is a time-based measurement of the amount of storage used in GB-hours. The storage measured for codespaces includes:

* Any files you use in a codespace, such as cloned repositories and configuration files
* Any data loaded to the codespace (for example, as input or output of the software running in the repository)
* Any extensions
* Any prebuilt codespaces, see [About GitHub Codespaces prebuilds](/en/codespaces/prebuilding-your-codespaces/about-github-codespaces-prebuilds)
* Any custom dev containers, see [Introduction to dev containers](/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration/introduction-to-dev-containers#creating-a-custom-dev-container-configuration)

### Storage volume for codespaces built from custom configurations

By default, your codespace is built from the default Linux image, also known as the "default dev container configuration". If you build a codespace from a custom dev container configuration, you will see an increased storage volume. See [Introduction to dev containers](/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration/introduction-to-dev-containers#creating-a-custom-dev-container-configuration).

* **Default Linux image**: the storage volume for your codespace is based only on the files in your repository and any files you add to the codespace.
* **Custom base image**: the storage volume for your codespace includes the custom dev container, in addition to all the files in the repository and codespace.

Containers based on the default image are not included in your storage volume, even if you add features in your dev container configuration. See [Adding features to a devcontainer.json file](/en/codespaces/setting-up-your-project-for-codespaces/configuring-dev-containers/adding-features-to-a-devcontainer-file).

## Free and billed use by personal accounts

GitHub plans for organizations and enterprises do not include a free quota for GitHub Codespaces.

### Free quota

All GitHub personal accounts include a quota of free compute time and storage for GitHub Codespaces. Any usage beyond the included amounts is billed to the personal account.

| Account plan                      | Storage per month | Compute time per month |
| --------------------------------- | ----------------- | ---------------------- |
| GitHub Free for personal accounts | 15 GB-month       | 120 hrs                |
| GitHub Pro                        | 20 GB-month       | 180 hrs                |

> \[!NOTE] GitHub Codespaces is not available for repositories that are owned by managed user accounts. For more information, see [About Enterprise Managed Users](/en/enterprise-cloud@latest/admin/concepts/identity-and-access-management/enterprise-managed-users).

For tips on making your allowed usage go further, see [Getting the most out of your included usage](/en/codespaces/troubleshooting/troubleshooting-included-usage).

### Using more than your included quota

If your account does not have a valid payment method on file, usage is blocked once you use up your quota.

If you are blocked from resuming a codespace and need to continue work on changes in your codespace, you can do any of the following:

* Add a payment method and review your budget settings to ensure they meet your usage needs. See [Setting up budgets to control spending on metered products](/en/billing/how-tos/set-up-budgets#viewing-budgets).
* Export the changes from the codespace to a branch. See [Exporting changes to a branch](/en/codespaces/troubleshooting/exporting-changes-to-a-branch).
* Wait for your monthly included usage to reset at the start of the next monthly billing cycle.

## Paying for use

You pay for using Codespaces using the payment method set up for your GitHub account. See [Managing your payment and billing information](/en/billing/how-tos/set-up-payment/manage-payment-info).

* To estimate costs for paid GitHub Codespaces usage, use the GitHub [pricing calculator](https://github.com/pricing/calculator?feature=codespaces).
* To view your current minutes and storage, see [Viewing your usage of metered products and licenses](/en/billing/how-tos/products/view-productlicense-use).
* To optimize the use of codespaces:
  * For personal accounts, see [Getting the most out of your included usage](/en/codespaces/troubleshooting/troubleshooting-included-usage)
  * For organization accounts, see [Managing the cost of GitHub Codespaces in your organization](/en/codespaces/managing-codespaces-for-your-organization/managing-the-cost-of-github-codespaces-in-your-organization)

### Pricing

The compute cost is proportional to the number of processor cores in the machine type you choose for your codespace, as shown in the following table. For example, the compute cost of using a codespace for an hour on a 16-core machine is eight times greater than a 2-core machine.

| Component          | Machine type | Unit of measure | Included usage multiplier | Price |
| ------------------ | ------------ | --------------- | ------------------------- | ----- |
| Codespaces compute | 2 core       | 1 hour          | 2                         | $0.18 |
| Codespaces compute | 4 core       | 1 hour          | 4                         | $0.36 |
| Codespaces compute | 8 core       | 1 hour          | 8                         | $0.72 |
| Codespaces compute | 16 core      | 1 hour          | 16                        | $1.44 |
| Codespaces compute | 32 core      | 1 hour          | 32                        | $2.88 |
| Codespaces storage | Storage      | 1 GB-month      | Not applicable            | $0.07 |

## How costs are assigned to a billable account

All usage is billed either to the account of the person who created the codespace or to the owning-organization. See [Choosing who owns and pays for codespaces in your organization](/en/codespaces/managing-codespaces-for-your-organization/choosing-who-owns-and-pays-for-codespaces-in-your-organization).

When a repository is transferred to a different organization, ownership and billing responsibility for any codespaces associated with that repository change according to the settings of the new organization.

If a user is removed from an organization or repository, their codespaces are automatically deleted.

### Forked repositories

Codespaces created from a forked repository are billed to your personal account unless the upstream (or parent) repository is in an organization that has allowed you - as a member, or outside collaborator, of the organization - to use codespaces at the organization's expense.

For example, consider a member, or outside collaborator, of an organization that has allowed billing for codespaces for that user. If the user has permission to fork an organization-owned private repository, they can subsequently create and use a codespace for the new repository at the organization's expense. This is because the organization is the owner of the parent repository. Note that the organization owner can remove the user's access to the private repository, the forked repository, and therefore also the codespace. The organization owner can also delete the parent repository which will also delete the forked repository. See [Managing the forking policy for your repository](/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/managing-the-forking-policy-for-your-repository).

If you create prebuilds for a forked repository, the storage cost of those prebuilds is subtracted from your monthly included storage, while available. If you have used all of your included storage, and you have set up billing, your personal account will be billed. This is true even when the codespaces you create for a fork are paid for by the organization that owns the parent repository.

### GitHub Codespaces templates

Any organization can maintain a template repository for use with GitHub Codespaces. As with any other repository in an organization, a codespace created from a template repository is billed to the organization if the organization allows the user creating the codespace to do so at the organization's expense. Otherwise, the codespace is billed to the user who creates the codespace.

If a user publishes a codespace created from a template, the codespace is published to a new repository owned by the user's personal account. If the codespace is currently billed to an organization, ownership and billing of the codespace transfer to the user who created the codespace.

A managed user account cannot be the billable owner of a codespace. Therefore:

* A managed user account can only create a codespace from a template if the codespace is billed to an organization.
* A managed user account cannot publish a codespace created from a template to a new repository.

## Managing your budget for GitHub Codespaces

If your account does not have a valid payment method on file, usage is blocked once you use up your quota.

If you have a valid payment method on file, spending may be limited by one or more budgets. Check the budgets set for your account to ensure they are appropriate for your usage needs. See [Setting up budgets to control spending on metered products](/en/billing/how-tos/set-up-budgets).

You can also receive email notifications when your included GitHub Codespaces usage reaches 90% and 100% during a billing period. For more information, see [Budgets and alerts](/en/billing/concepts/budgets-and-alerts#included-usage-alerts).

If your personal, organization, or enterprise account uses all of its quota or budget, you will no longer be able to create or resume codespaces that are billable to that account. However, you can still export any work-in-progress changes to a new branch. For more information, see [Exporting changes to a branch](/en/codespaces/troubleshooting/exporting-changes-to-a-branch).

## Further reading

* [Quickstart for GitHub Codespaces](/en/codespaces/quickstart)
* [Enabling or disabling GitHub Codespaces for your organization](/en/codespaces/managing-codespaces-for-your-organization/enabling-or-disabling-github-codespaces-for-your-organization)
* [Managing the cost of GitHub Codespaces in your organization](/en/codespaces/managing-codespaces-for-your-organization/managing-the-cost-of-github-codespaces-in-your-organization)