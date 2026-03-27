import type { HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getPlannerContainer } from "../../shared/cosmosClient";
import { jsonResponse } from "../../shared/response";
import type { WeekPlannerDocument } from "../../types";

// Return planner data for a specific week; create a default doc if none exists.
export async function getPlannerData(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const weekStart = request.query.get("weekStart");

    if (!weekStart) {
      return jsonResponse(400, { message: "Missing weekStart query parameter." });
    }

    const container = getPlannerContainer();

    const queryResult = await container.items
      .query<WeekPlannerDocument>({
        query: "SELECT * FROM c WHERE c.weekStartIso = @weekStart",
        parameters: [{ name: "@weekStart", value: weekStart }]
      })
      .fetchAll();

    if (queryResult.resources.length > 0) {
      return jsonResponse(200, queryResult.resources[0]);
    }

    const defaultDoc: WeekPlannerDocument = {
      id: `week-${weekStart}`,
      weekStartIso: weekStart,
      habits: {
        "Morning Walk": [false, false, false, false, false, false, false],
        Vitamins: [false, false, false, false, false, false, false]
      },
      weeklyTasks: [],
      dailyBoards: []
    };

    const created = await container.items.create(defaultDoc);
    return jsonResponse(200, created.resource);
  } catch (error) {
    context.error("getPlannerData failed", error);
    return jsonResponse(500, { message: "Could not retrieve planner data." });
  }
}
