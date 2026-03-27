using '../main.bicep'

// Shared baseline file used by all environments.
// Environment-specific values are injected by CI/CD from variables/*.yml.
// This file is a template; placeholders are replaced at deployment time.
// Must be a valid literal because main.bicep constrains allowed values.
param environmentCode = 'POC'
param location = '__LOCATION__'
param projectName = '__PROJECT_NAME__'
param tenantId = '__TENANT_ID__'
// Must be a valid literal because main.bicep constrains allowed values.
param staticWebAppSku = 'Free'
param cosmosDbName = '__COSMOS_DB_NAME__'
param cosmosContainerName = '__COSMOS_CONTAINER_NAME__'
