// -----------------------------
// Environment inputs
// -----------------------------
@allowed([
  'POC'
  'DEV'
  'PRD'
])
param environmentCode string

param location string
param projectName string
param tenantId string

// -----------------------------
// App and data settings
// -----------------------------
@allowed([
  'Free'
  'Standard'
])
param staticWebAppSku string

param cosmosDbName string
param cosmosContainerName string

// -----------------------------
// Naming helpers
// -----------------------------
var envLower = toLower(environmentCode)
var suffix = uniqueString(resourceGroup().id, projectName, envLower)
var suffix6 = take(suffix, 6)
var resolvedTenantId = empty(tenantId) ? subscription().tenantId : tenantId

var appInsightsName = 'appi-${projectName}-${envLower}-${suffix6}'
var logAnalyticsName = 'log-${projectName}-${envLower}-${suffix6}'
var functionStorageName = toLower('st${projectName}${envLower}${suffix6}')
var functionPlanName = 'plan-${projectName}-${envLower}'
var functionAppName = 'func-${projectName}-${envLower}-${suffix6}'
var cosmosName = 'cosmos-${projectName}-${envLower}-${suffix6}'
var keyVaultName = 'kv-${projectName}-${envLower}-${suffix6}'
var staticWebAppName = 'swa-${projectName}-${envLower}-${suffix6}'

// -----------------------------
// Monitoring resources
// -----------------------------
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

// -----------------------------
// Backend compute resources
// -----------------------------
resource functionStorage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: functionStorageName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    supportsHttpsTrafficOnly: true
    minimumTlsVersion: 'TLS1_2'
  }
}

resource functionPlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: functionPlanName
  location: location
  sku: {
    name: 'Y1'
    tier: 'Dynamic'
  }
  kind: 'functionapp'
  properties: {
    reserved: false
  }
}

resource functionApp 'Microsoft.Web/sites@2023-12-01' = {
  name: functionAppName
  location: location
  kind: 'functionapp'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: functionPlan.id
    httpsOnly: true
    siteConfig: {
      appSettings: [
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'node'
        }
        {
          name: 'WEBSITE_RUN_FROM_PACKAGE'
          value: '1'
        }
        {
          name: 'AzureWebJobsStorage'
          value: 'DefaultEndpointsProtocol=https;AccountName=${functionStorage.name};AccountKey=${functionStorage.listKeys().keys[0].value};EndpointSuffix=${environment().suffixes.storage}'
        }
        {
          name: 'APPINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'COSMOS_ENDPOINT'
          value: cosmos.properties.documentEndpoint
        }
        {
          name: 'COSMOS_KEY'
          value: cosmos.listKeys().primaryMasterKey
        }
        {
          name: 'COSMOS_DATABASE_NAME'
          value: cosmosDbName
        }
        {
          name: 'COSMOS_CONTAINER_NAME'
          value: cosmosContainerName
        }
      ]
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      http20Enabled: true
    }
  }
}

// -----------------------------
// Data and secrets resources
// -----------------------------
resource cosmos 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: cosmosName
  location: location
  kind: 'GlobalDocumentDB'
  properties: {
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: location
        failoverPriority: 0
      }
    ]
    capabilities: [
      {
        name: 'EnableServerless'
      }
    ]
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    publicNetworkAccess: 'Enabled'
    enableFreeTier: false
  }
}

resource cosmosDb 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases@2023-04-15' = {
  parent: cosmos
  name: cosmosDbName
  properties: {
    resource: {
      id: cosmosDbName
    }
  }
}

resource cosmosContainer 'Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers@2023-04-15' = {
  parent: cosmosDb
  name: cosmosContainerName
  properties: {
    resource: {
      id: cosmosContainerName
      partitionKey: {
        paths: [
          '/weekStartIso'
        ]
        kind: 'Hash'
      }
    }
  }
}

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    tenantId: resolvedTenantId
    sku: {
      family: 'A'
      name: 'standard'
    }
    enableRbacAuthorization: true
    publicNetworkAccess: 'Enabled'
    enabledForDeployment: false
    enabledForTemplateDeployment: false
    enabledForDiskEncryption: false
    softDeleteRetentionInDays: 7
  }
}

// -----------------------------
// Frontend hosting resource
// -----------------------------
resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: staticWebAppName
  location: location
  sku: {
    name: staticWebAppSku
    tier: staticWebAppSku
  }
  properties: {
    repositoryUrl: ''
    branch: ''
    buildProperties: {
      appLocation: 'frontend'
      apiLocation: 'backend'
      appArtifactLocation: 'dist'
    }
  }
}

// -----------------------------
// Outputs for downstream scripts
// -----------------------------
output staticWebAppName string = staticWebApp.name
output functionAppName string = functionApp.name
output cosmosAccountName string = cosmos.name
output keyVaultName string = keyVault.name
output applicationInsightsName string = appInsights.name
