import type { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getPlannerContainer } from "../../shared/cosmosClient";
import { jsonResponse } from "../../shared/response";
import type { TaskItem, WeekPlannerDocument } from "../../types";

// Insert or update a weekly task in the requested planner week.
export async function upsertTask(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const payload = (await request.json()) as {
      weekStartIso: string;
      task: TaskItem;
    };

    if (!payload?.weekStartIso || !payload?.task) {
      return jsonResponse(400, { message: "Body must include weekStartIso and task." });
    }

    const container = getPlannerContainer();

    const queryResult = await container.items
      .query<WeekPlannerDocument>({
        query: "SELECT * FROM c WHERE c.weekStartIso = @weekStart",
        parameters: [{ name: "@weekStart", value: payload.weekStartIso }]
      })
      .fetchAll();

    const existing = queryResult.resources[0];

    if (!existing) {
      return jsonResponse(404, { message: "Week document not found." });
    }

    const withoutCurrent = existing.weeklyTasks.filter((task) => task.id !== payload.task.id);
    const updated: WeekPlannerDocument = {
      ...existing,
      weeklyTasks: [payload.task, ...withoutCurrent]
    };

    const replaced = await container.item(existing.id, existing.id).replace(updated);
    return jsonResponse(200, replaced.resource);
  } catch (error) {
    context.error("upsertTask failed", error);
    return jsonResponse(500, { message: "Could not upsert task." });
  }
}
