# Project Start — Next Steps

This document outlines everything needed to take the scaffolded repository from its current state to a fully running application across your Azure environments. Steps are grouped by goal so you can work through each area independently.

---

## Section 1 — Prerequisites

Before doing anything else, ensure the following tools are installed and authenticated on your local machine.

| Tool | Minimum Version | Install |
|------|----------------|---------|
| Node.js | 20 LTS | https://nodejs.org |
| Azure CLI | Latest | https://learn.microsoft.com/cli/azure/install-azure-cli |
| Bicep CLI | Latest | `az bicep install` |
| Git | Any recent | https://git-scm.com |

Verify the installs:

```bash
node -v
az version
az bicep version
git --version
```

Log in to Azure CLI locally (useful for testing deployments from your machine before trusting CI/CD):

```bash
az login
az account set --subscription "<your-subscription-id>"
```

---

## Section 2 — Azure Tenant Setup (One-Off)

These steps are performed once per tenant/subscription and create the identity that GitHub Actions uses to authenticate with Azure.

### 2.1 — Create or identify your Azure subscription(s)

Decide whether POC, DEV, and PRD will share one subscription or have separate ones. For a personal project a single subscription is fine; you can still isolate them by resource group.

Note down your:
- **Tenant ID** — found in Azure Portal > Microsoft Entra ID > Overview > Tenant ID
- **Subscription ID** — found in Azure Portal > Subscriptions

### 2.2 — Register an Entra application for GitHub Actions

In **Azure Portal > Microsoft Entra ID > App registrations > New registration**:

1. Name it something descriptive, e.g. `sp-dailyplanner-github-actions`.
2. Leave the redirect URI blank — not needed for OIDC.
3. Click **Register**.
4. Note down the **Application (client) ID** from the overview page.

### 2.3 — Add a Federated Credential (OIDC) for each GitHub Environment

This is what allows GitHub Actions to authenticate without storing a password or certificate.

In the app registration you just created, go to **Certificates & secrets > Federated credentials > Add credential**.

Add one credential per GitHub Environment (`POC`, `DEV`, `PRD`):

| Field | Value |
|-------|-------|
| Federated credential scenario | GitHub Actions deploying Azure resources |
| Organisation | `alfiejw` |
| Repository | `dailyPlanner-app` |
| Entity type | Environment |
| GitHub Environment name | `POC` (then repeat for `DEV` and `PRD`) |
| Name | e.g. `github-env-poc` |

> **Why per-environment?** The `deploy-infra.yml` and `build-and-deploy-app.yml` workflows bind each job to a named GitHub Environment (e.g. `environment: POC`). Azure scopes the OIDC trust to that environment name, so the credential is only valid when the job targets the matching environment.

### 2.4 — Grant the application RBAC on your subscription/resource group

The service principal needs permission to create and manage Azure resources.

For a broad POC setup, grant **Contributor** at the subscription level:

```bash
az role assignment create \
  --assignee "<Application (client) ID from step 2.2>" \
  --role "Contributor" \
  --scope "/subscriptions/<your-subscription-id>"
```

For tighter control, grant **Contributor** scoped to each resource group after creating them (see Section 3).

> The `az group create` in `deploy-infra.yml` is idempotent — it is safe to run on every deployment and will not destroy an existing group.

---

## Section 3 — Update Repository Variable Files

The three environment variable files contain placeholder values that must be replaced with your real Azure identifiers before any deployment will succeed.

Edit each of the following files:

**`variables/poc.yml`**, **`variables/dev.yml`**, **`variables/prd.yml`**

Replace these lines in each file:

```yaml
tenantId: '00000000-0000-0000-0000-000000000000'
subscriptionIdPlaceholder: '00000000-0000-0000-0000-000000000000'
```

With your real values, e.g.:

```yaml
tenantId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
subscriptionIdPlaceholder: 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy'
```

> `subscriptionIdPlaceholder` is not wired into the Bicep deployment directly — the active subscription is controlled via `az account set` in the workflow using `secrets.AZURE_SUBSCRIPTION_ID`. This field exists as a human-readable record and as a future hook.

---

## Section 4 — Configure GitHub Repository

### 4.1 — Create GitHub Environments

In your GitHub repository (`alfiejw/dailyPlanner-app`):

**Settings > Environments > New environment**

Create three environments:
- `POC`
- `DEV`
- `PRD`

> Optional: on `PRD`, enable **Required reviewers** so a manual approval is needed before production deployments proceed.

### 4.2 — Add Secrets to Each Environment

For each environment, add the following three secrets under **Settings > Environments > [environment name] > Environment secrets**:

| Secret Name | Value |
|-------------|-------|
| `AZURE_CLIENT_ID` | Application (client) ID from Section 2.2 |
| `AZURE_TENANT_ID` | Your tenant ID from Section 2.1 |
| `AZURE_SUBSCRIPTION_ID` | Your subscription ID from Section 2.1 |

> These three secrets are referenced in `deploy-infra.yml` and `build-and-deploy-app.yml` as `secrets.AZURE_CLIENT_ID`, `secrets.AZURE_TENANT_ID`, and `secrets.AZURE_SUBSCRIPTION_ID`. They must exist in the environment that the job targets — repo-level secrets alone are not enough due to the `environment:` binding on each job.

---

## Section 5 — Install Dependencies Locally

The GitHub Actions build job uses `npm ci`, which requires `package-lock.json` files to exist. Generate them now by running `npm install` in each layer:

```bash
cd frontend
npm install
cd ../backend
npm install
```

Commit the resulting `package-lock.json` files:

```bash
git add frontend/package-lock.json backend/package-lock.json
git commit -m "chore: add package-lock.json files for CI caching"
git push
```

---

## Section 6 — Deploy Infrastructure (First Run)

With secrets in place and variable files updated, trigger the infrastructure workflow manually:

1. In GitHub, go to **Actions > Deploy Infrastructure > Run workflow**.
2. Select environment `POC`.
3. Click **Run workflow**.

The workflow will:
- Parse `variables/common.yml` and `variables/poc.yml`
- Render a generated `.bicepparam` file from the `shared.bicepparam` template
- Create the resource group `rg-dailyplanner-poc-uks` (idempotent)
- Deploy all Azure resources defined in `infra/main.bicep`

On success, the following resources will be live in your subscription:
- Azure Static Web App
- Azure Functions app (Consumption plan)
- Cosmos DB (Serverless)
- Key Vault
- Application Insights + Log Analytics workspace

Repeat for `DEV` and `PRD` when ready.

---

## Section 7 — Deploy the Application

> **Note**: the deploy stage of `build-and-deploy-app.yml` currently contains a placeholder step. The build stage is complete. The deploy stage needs to be wired to the Azure Static Web Apps deploy action and the Function App deployment command before this workflow will fully deploy the application. This is the next pending development task.

When that step is complete, trigger the workflow:

1. **Actions > Build and Deploy App > Run workflow**
2. Select the target environment
3. Click **Run workflow**

---

## Section 8 — Verify the Application

After a successful infrastructure + app deployment:

1. In Azure Portal, navigate to the Static Web App resource for your environment.
2. Copy the **URL** from the overview pane.
3. Open it in a browser — you should see the daily planner UI.
4. Check **Application Insights > Live Metrics** for backend activity.
5. Check **Cosmos DB > Data Explorer** to confirm the `planner` container exists.

---

## Section 9 — Ongoing Development Workflow

| Action | Command / Trigger |
|--------|-------------------|
| Change infrastructure | Edit `infra/main.bicep` → push → run **Deploy Infrastructure** workflow |
| Change environment values | Edit `variables/<env>.yml` → push → run **Deploy Infrastructure** workflow |
| Change frontend or backend | Push to `main` → run **Build and Deploy App** workflow |
| Promote POC changes to DEV | Run **Deploy Infrastructure** → **Build and Deploy App** targeting `DEV` |
| Promote to PRD | Same, targeting `PRD` (approval gate fires if configured) |

---

## Summary Checklist

- [ ] Node.js, Azure CLI, Bicep CLI installed and verified
- [ ] Tenant ID and Subscription ID noted
- [ ] Entra app registration created — Client ID noted
- [ ] Federated OIDC credential added for `POC`, `DEV`, and `PRD` GitHub environments
- [ ] Contributor RBAC granted to the service principal
- [ ] `variables/poc.yml`, `dev.yml`, `prd.yml` updated with real tenant and subscription IDs
- [ ] GitHub Environments `POC`, `DEV`, `PRD` created
- [ ] `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID` secrets added to each environment
- [ ] `npm install` run in `frontend/` and `backend/`; `package-lock.json` files committed and pushed
- [ ] **Deploy Infrastructure** workflow triggered for `POC` — completed successfully
- [ ] **Build and Deploy App** deploy stage wired up (pending development task)
- [ ] **Build and Deploy App** workflow triggered for `POC` — completed successfully
- [ ] Application verified in browser via Static Web App URL
