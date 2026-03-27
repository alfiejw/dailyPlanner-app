# dailyPlanner-app

Example monorepo for a React-based personal planner web app with an Azure Functions backend and Azure IaC + pipeline automation.

## Architecture Direction

This repository follows the budget-first architecture selected in the planning document:

- Frontend: React app hosted on Azure Static Web Apps.
- Backend: Azure Functions on Consumption plan.
- Data: Azure Cosmos DB in serverless mode.
- Security/Secrets: Key Vault + managed identity ready placeholders.
- Monitoring: Application Insights + Log Analytics workspace.
- Networking: No VNet/private endpoint in the default budget template.
- Region: `uksouth` for all deployed resources.

## Repository Layout

- `frontend/`: React + TypeScript UI application.
- `backend/`: Azure Functions (TypeScript) API and scheduled rollover job.
- `infra/`: Bicep templates and environment parameter files.
- `pipelines/`: Azure DevOps pipeline YAML definitions.
- `variables/`: Environment-specific variable templates (`POC`, `DEV`, `PRD`).

## Environment Model

Three environment codes are used consistently across infra + pipelines:

- `POC`: Proof of concept.
- `DEV`: Development.
- `PRD`: Production.

The same Bicep templates are reused for all environments, with environment-specific values supplied via parameter files and pipeline variable templates.

## Quick Start (Local)

### Frontend

1. `cd frontend`
2. `npm install`
3. Copy one of `.env.poc`, `.env.dev`, `.env.prd` to `.env.local` and update values.
4. `npm run dev`

### Backend

1. `cd backend`
2. `npm install`
3. Copy `local.settings.json.example` to `local.settings.json` and update values.
4. `npm run build`
5. `npm run start`

## Deploying With Pipeline

The main pipeline accepts an environment code parameter (`POC`, `DEV`, or `PRD`) and automatically:

1. Loads the matching variable file from `variables/`.
2. Deploys the same Bicep templates from `infra/`.
3. Applies the matching Bicep parameter file.

Tenant and subscription identifiers are intentionally placeholders so you can populate them when your Azure tenant and subscriptions are finalized.
