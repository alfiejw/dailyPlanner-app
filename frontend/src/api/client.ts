import type { WeekPlanner } from "../types/planner";

// The API URL comes from environment-specific files (.env.poc/.env.dev/.env.prd).
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string;

export async function fetchWeekPlanner(weekStartIso: string): Promise<WeekPlanner> {
  // Fallback response helps frontend development before backend is fully wired.
  if (!apiBaseUrl) {
    return {
      weekStartIso,
      habits: {
        "Morning Walk": [true, true, false, false, true, false, true],
        Vitamins: [true, true, true, true, true, false, true]
      },
      weeklyTasks: [],
      dailyBoards: []
    };
  }

  const response = await fetch(`${apiBaseUrl}/api/planner/week?weekStart=${weekStartIso}`);

  if (!response.ok) {
    throw new Error(`Unable to fetch planner week data. Status: ${response.status}`);
  }

  return (await response.json()) as WeekPlanner;
}
