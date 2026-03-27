import type { TaskItem } from "../types/planner";
import { ProgressBar } from "./ProgressBar";

interface WeeklyTodoViewProps {
  tasks: TaskItem[];
}

export function WeeklyTodoView({ tasks }: WeeklyTodoViewProps) {
  const completed = tasks.filter((task) => task.isCompleted).length;

  return (
    <section className="panel">
      <h2>Weekly To-Do</h2>
      <ProgressBar label="Weekly Progress" completed={completed} total={tasks.length} />
      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id}>
            <span>{task.isCompleted ? "[x]" : "[ ]"}</span>
            <span>{task.title}</span>
            <span className={`priority-chip priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
            <span>{new Date(task.dueDateIso).toLocaleDateString("en-GB")}</span>
            <span>{task.isPinned ? "Pinned" : ""}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
