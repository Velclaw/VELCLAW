terraform {
  required_version = ">= 1.7.0"
  required_providers {
    google = {
      source = "hashicorp/google"
      version = ">= 6.0, < 8.0"
    }
  }
}
provider "google" { project = var.project_id region = var.region }

resource "google_project_service" "required" {
  for_each = toset(["artifactregistry.googleapis.com","run.googleapis.com","cloudbuild.googleapis.com","secretmanager.googleapis.com","iam.googleapis.com","iamcredentials.googleapis.com"])
  service = each.value
  disable_on_destroy = false
}

resource "google_artifact_registry_repository" "velclaw" {
  location = var.region
  repository_id = var.artifact_registry_repository
  description = "Velclaw production container images"
  format = "DOCKER"
  depends_on = [google_project_service.required]
}

resource "google_service_account" "runtime" {
  account_id = var.runtime_service_account
  display_name = "Velclaw Cloud Run runtime"
}

resource "google_service_account" "build" {
  account_id = var.build_service_account
  display_name = "Velclaw Cloud Build deployer"
}

resource "google_project_iam_member" "build_roles" {
  for_each = toset(["roles/artifactregistry.writer","roles/run.admin","roles/logging.logWriter"])
  project = var.project_id
  role = each.value
  member = "serviceAccount:${google_service_account.build.email}"
}

resource "google_service_account_iam_member" "build_act_as_runtime" {
  service_account_id = google_service_account.runtime.name
  role = "roles/iam.serviceAccountUser"
  member = "serviceAccount:${google_service_account.build.email}"
}

resource "google_cloud_run_v2_service" "velclaw" {
  name = var.cloud_run_service
  location = var.region
  template {
    service_account = google_service_account.runtime.email
    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello"
      ports { container_port = 8080 }
    }
    scaling { min_instance_count = 0 max_instance_count = var.max_instances }
  }
  depends_on = [google_project_service.required, google_artifact_registry_repository.velclaw]
}

resource "google_cloud_run_v2_service_iam_member" "public" {
  name = google_cloud_run_v2_service.velclaw.name
  location = var.region
  role = "roles/run.invoker"
  member = "allUsers"
}

output "artifact_registry_repository" { value = google_artifact_registry_repository.velclaw.name }
output "cloud_run_service" { value = google_cloud_run_v2_service.velclaw.uri }
output "build_service_account" { value = google_service_account.build.email }
output "runtime_service_account" { value = google_service_account.runtime.email }
