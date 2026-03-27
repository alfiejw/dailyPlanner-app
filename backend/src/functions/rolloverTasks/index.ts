import type { InvocationContext, Timer } from "@azure/functions";
import { getPlannerContainer } from "../../shared/cosmosClient";
import type { WeekPlannerDocument } from "../../types";

// Scheduled job that rolls incomplete unpinned daily tasks to the next day.
export async function rolloverTasks(_timer: Timer, context: InvocationContext): Promise<void> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString().slice(0, 10);

    const container = getPlannerContainer();

    const queryResult = await container.items
      .query<WeekPlannerDocument>({
        query: "SELECT * FROM c"
      })
      .fetchAll();

    for (const week of queryResult.resources) {
      let hasChanges = false;

      for (const board of week.dailyBoards) {
        if (board.isoDate.slice(0, 10) !== todayIso) {
          continue;
        }

        const carryOver = board.tasks.filter((task) => !task.isCompleted && !task.isPinned);

        if (carryOver.length === 0) {
          continue;
        }

        const nextDay = new Date(board.isoDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayIso = nextDay.toISOString().slice(0, 10);

        const targetBoard = week.dailyBoards.find((candidate) => candidate.isoDate.slice(0, 10) === nextDayIso);

        if (!targetBoard) {
          continue;
        }

        targetBoard.tasks = [...carryOver, ...targetBoard.tasks];
        board.tasks = board.tasks.filter((task) => task.isCompleted || task.isPinned);
        hasChanges = true;
      }

      if (hasChanges) {
        await container.item(week.id, week.id).replace(week);
      }
    }

    context.log("Task rollover job completed.");
  } catch (error) {
    context.error("rolloverTasks failed", error);
  }
}
