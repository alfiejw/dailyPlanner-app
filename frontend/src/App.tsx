import { useEffect, useMemo, useState } from "react";
import { fetchWeekPlanner } from "./api/client";
import { DailyBoardView } from "./components/DailyBoardView";
import { TaskComposer } from "./components/TaskComposer";
import { WeekSelector } from "./components/WeekSelector";
import { WeeklyHabitsView } from "./components/WeeklyHabitsView";
import { WeeklyTodoView } from "./components/WeeklyTodoView";
import { getWeekStart } from "./lib/date";
import type { TaskItem, WeekPlanner } from "./types/planner";

const emptyPlanner: WeekPlanner = {
  weekStartIso: new Date().toISOString(),
  habits: {},
  weeklyTasks: [],
  dailyBoards: []
};

export default function App() {
  // Store and navigate the selected week start date.
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart(new Date()));
  const [planner, setPlanner] = useState<WeekPlanner>(emptyPlanner);
  const [view, setView] = useState<"habits" | "weekly" | "daily">("weekly");

  // Keep week key stable for API calls and memoized operations.
  const weekStartIso = useMemo(() => weekStart.toISOString(), [weekStart]);

  useEffect(() => {
    void fetchWeekPlanner(weekStartIso)
      .then((data) => setPlanner(data))
      .catch(() => setPlanner(emptyPlanner));
  }, [weekStartIso]);

  function shiftWeek(days: number) {
    setWeekStart((current) => {
      const next = new Date(current);
      next.setDate(current.getDate() + days);
      return next;
    });
  }

  function createWeeklyTask(title: string) {
    const task: TaskItem = {
      id: crypto.randomUUID(),
      title,
      priority: "Medium",
      dueDateIso: weekStartIso,
      isCompleted: false,
      isPinned: false
    };

    setPlanner((current) => ({
      ...current,
      weeklyTasks: [task, ...current.weeklyTasks]
    }));
  }

  return (
    <main className="layout">
      <header className="hero">
        <div>
          <h1>Daily Planner</h1>
          <p>Weekly habits, weekly priorities, and daily focus in one calm workspace.</p>
        </div>
        <WeekSelector weekStart={weekStart} onShiftWeek={shiftWeek} />
      </header>

      <nav className="view-tabs" aria-label="Planner view selection">
        <button onClick={() => setView("habits")} className={view === "habits" ? "active" : ""}>Weekly Habits</button>
        <button onClick={() => setView("weekly")} className={view === "weekly" ? "active" : ""}>Weekly To-Do</button>
        <button onClick={() => setView("daily")} className={view === "daily" ? "active" : ""}>Daily Boards</button>
      </nav>

      <section className="content-stack">
        {view === "habits" && <WeeklyHabitsView habits={planner.habits} />}

        {view === "weekly" && (
          <>
            <TaskComposer onCreateTask={createWeeklyTask} />
            <WeeklyTodoView tasks={planner.weeklyTasks} />
          </>
        )}

        {view === "daily" && <DailyBoardView boards={planner.dailyBoards} />}
      </section>
    </main>
  );
}
