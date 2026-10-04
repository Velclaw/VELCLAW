variable "project_id" { type = string description = "Google Cloud project ID that owns Velclaw production." }
variable "region" { type = string default = "asia-southeast1" description = "Google Cloud region." }
variable "artifact_registry_repository" { type = string default = "velclaw" }
variable "cloud_run_service" { type = string default = "velclaw" }
variable "runtime_service_account" { type = string default = "velclaw-runtime" }
variable "build_service_account" { type = string default = "velclaw-cloudbuild" }
variable "max_instances" { type = number default = 10 }
