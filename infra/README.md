# Infrastructure (Bicep)

This directory contains the environment-agnostic Bicep templates for the planner app.

## Design

- Single template reused for `POC`, `DEV`, and `PRD`.
- Budget architecture defaults (no VNet/private endpoint/WAF).
- Region pinned to `uksouth` unless explicitly overridden.

## Files

- `main.bicep`: Primary resource deployment template.
- `parameters/shared.bicepparam`: Shared parameter template used for all environments.

Environment-specific differences are intentionally sourced from `variables/poc.yml`, `variables/dev.yml`, and `variables/prd.yml` by the deployment workflows.

During deployment, CI/CD renders a deployment-specific generated `.bicepparam` from `shared.bicepparam` by replacing placeholders with values from the common/environment variable templates.
