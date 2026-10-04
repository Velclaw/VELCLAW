# Velclaw Google Cloud bootstrap

Terraform provisions the Google APIs, Artifact Registry, Cloud Run service, runtime service account, Cloud Build deployer service account, and minimum IAM.

## Apply

Authenticate with an infrastructure account:

```bash
gcloud auth application-default login
gcloud auth application-default set-quota-project YOUR_PROJECT_ID
cd infra/google-cloud
terraform init
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

Do not commit terraform.tfvars or credentials.

The Cloud Run service starts from Google's public hello image as a safe bootstrap. The repository Cloud Build trigger replaces it with the immutable Velclaw image.

After bootstrap, connect GitHub repository Velclaw/VELCLAW in Cloud Build, create a push-to-main trigger using cloudbuild.yaml, select the velclaw-cloudbuild service account, configure application secrets in Secret Manager, then run the trigger.

This module does not store GitHub OAuth material, service-account keys, application secrets, or kubeconfigs.
