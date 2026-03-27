// Backend contracts mirror frontend planner models for consistent payload shape.
export type Priority = "Low" | "Medium" | "High";

export interface TaskItem {
  id: string;
  title: string;
  priority: Priority;
  dueDateIso: string;
  isCompleted: boolean;
  isPinned: boolean;
  scope: "Weekly" | "Daily";
  dayIso?: string;
}

export interface WeekPlannerDocument {
  id: string;
  weekStartIso: string;
  habits: Record<string, boolean[]>;
  weeklyTasks: TaskItem[];
  dailyBoards: Array<{
    isoDate: string;
    focus: string;
    tasks: TaskItem[];
    events: Array<{ id: string; title: string; startsAtIso: string }>;
  }>;
}
