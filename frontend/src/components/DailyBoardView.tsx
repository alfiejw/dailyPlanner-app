import type { DayBoard } from "../types/planner";
import { ProgressBar } from "./ProgressBar";

interface DailyBoardViewProps {
  boards: DayBoard[];
}

export function DailyBoardView({ boards }: DailyBoardViewProps) {
  return (
    <section className="daily-grid">
      {boards.map((board) => {
        const completed = board.tasks.filter((task) => task.isCompleted).length;

        return (
          <article key={board.isoDate} className="panel">
            <header className="daily-header">
              <h3>{new Date(board.isoDate).toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "short" })}</h3>
            </header>

            <section className="focus-box">
              <strong>Daily Focus</strong>
              <p>{board.focus || "Set a focus for this day."}</p>
            </section>

            <ProgressBar label="Daily Progress" completed={completed} total={board.tasks.length} />

            <h4>Tasks</h4>
            <ul className="task-list compact">
              {board.tasks.map((task) => (
                <li key={task.id}>
                  <span>{task.isCompleted ? "[x]" : "[ ]"}</span>
                  <span>{task.title}</span>
                  <span className={`priority-chip priority-${task.priority.toLowerCase()}`}>{task.priority}</span>
                </li>
              ))}
            </ul>

            <h4>Events</h4>
            <ul className="task-list compact">
              {board.events.map((eventItem) => (
                <li key={eventItem.id}>
                  <span>{new Date(eventItem.startsAtIso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                  <span>{eventItem.title}</span>
                </li>
              ))}
            </ul>
          </article>
        );
      })}
    </section>
  );
}
