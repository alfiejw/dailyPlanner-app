import { CosmosClient } from "@azure/cosmos";

// Create one reusable Cosmos client instance for all function executions.
const endpoint = process.env.COSMOS_ENDPOINT || "";
const key = process.env.COSMOS_KEY || "";

export const cosmosClient = new CosmosClient({ endpoint, key });

export function getPlannerContainer() {
  const databaseName = process.env.COSMOS_DATABASE_NAME || "plannerdb";
  const containerName = process.env.COSMOS_CONTAINER_NAME || "planner";
  return cosmosClient.database(databaseName).container(containerName);
}
