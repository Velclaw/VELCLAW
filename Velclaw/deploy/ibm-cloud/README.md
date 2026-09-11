# IBM Cloud runtime

This directory contains the host bootstrap contract for an IBM Cloud VPC VSI.

The provisioning layer supplies the VSI identifiers and credentials. The host bootstrap installs Docker and starts the canonical `deploy/docker-compose.selfhosted.yml` runtime.

Required runtime configuration remains in the deployment environment; secrets must not be committed to Git.
