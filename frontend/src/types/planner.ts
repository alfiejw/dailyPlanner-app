// Shared planner data contracts used across UI components.
export type Priority = "Low" | "Medium" | "High";

export interface TaskItem {
  id: string;
  title: string;
  priority: Priority;
  dueDateIso: string;
  isCompleted: boolean;
  isPinned: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  startsAtIso: string;
}

export interface DayBoard {
  isoDate: string;
  focus: string;
  tasks: TaskItem[];
  events: EventItem[];
}

export interface WeekPlanner {
  weekStartIso: string;
  habits: Record<string, boolean[]>;
  weeklyTasks: TaskItem[];
  dailyBoards: DayBoard[];
}
