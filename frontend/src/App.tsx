import { useEffect, useMemo, useState } from "react";
import { fetchWeekPlanner } from "./api/client";
import { DailyBoardView } from "./components/DailyBoardView";
import { TaskComposer } from "./components/TaskComposer";
import { WeekSelector } from "./components/WeekSelector";
import { WeeklyHabitsView } from "./components/WeeklyHabitsView";
import { WeeklyTodoView } from "./components/WeeklyTodoView";
import { getWeekStart } from "./lib/date";
import type { TaskItem, WeekPlanner } from "./types/planner";

type ThemeMode = "dark" | "light";
const darkBaseOptions = [
  { value: "red", label: "Crimson Ember", hint: "Bold and focused" },
  { value: "orange", label: "Burnt Amber", hint: "Warm and steady" },
  { value: "yellow", label: "Golden Dusk", hint: "Soft and optimistic" },
  { value: "green", label: "Forest Green", hint: "Grounded and calm" },
  { value: "blue", label: "Ocean Blue", hint: "Balanced contrast" },
  { value: "indigo", label: "Midnight Indigo", hint: "Deep and thoughtful" },
  { value: "violet", label: "Night Violet", hint: "Richer contrast" }
] as const;

const lightBaseOptions = [
  { value: "red", label: "Rose Tint", hint: "Warm and lively" },
  { value: "orange", label: "Warm Amber", hint: "Friendly and bright" },
  { value: "yellow", label: "Sunlit Cream", hint: "Cheerful and clear" },
  { value: "green", label: "Fresh Sage", hint: "Low glare" },
  { value: "blue", label: "Soft Sky", hint: "Clean and crisp" },
  { value: "indigo", label: "Lavender Mist", hint: "Gentle and balanced" },
  { value: "violet", label: "Orchid Haze", hint: "Calm and creative" }
] as const;

type DarkBase = (typeof darkBaseOptions)[number]["value"];
type LightBase = (typeof lightBaseOptions)[number]["value"];
type PlannerView = "habits" | "weekly" | "daily" | "settings";

function getInitialTheme(): ThemeMode {
  const saved = localStorage.getItem("planner-theme");
  if (saved === "dark" || saved === "light") {
    return saved;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialDarkBase(): DarkBase {
  const saved = localStorage.getItem("planner-dark-base");
  if (saved === "red" || saved === "orange" || saved === "yellow" || saved === "green" || saved === "blue" || saved === "indigo" || saved === "violet") {
    return saved;
  }

  return "blue";
}

function getInitialLightBase(): LightBase {
  const saved = localStorage.getItem("planner-light-base");
  if (saved === "red" || saved === "orange" || saved === "yellow" || saved === "green" || saved === "blue" || saved === "indigo" || saved === "violet") {
    return saved;
  }

  return "orange";
}

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
  const [view, setView] = useState<PlannerView>("weekly");
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [darkBase, setDarkBase] = useState<DarkBase>(getInitialDarkBase);
  const [lightBase, setLightBase] = useState<LightBase>(getInitialLightBase);

  // Keep week key stable for API calls and memoized operations.
  const weekStartIso = useMemo(() => weekStart.toISOString(), [weekStart]);

  useEffect(() => {
    void fetchWeekPlanner(weekStartIso)
      .then((data) => setPlanner(data))
      .catch(() => setPlanner(emptyPlanner));
  }, [weekStartIso]);

  useEffect(() => {
    document.body.dataset.theme = theme;
    document.body.dataset.darkBase = darkBase;
    document.body.dataset.lightBase = lightBase;
    document.body.dataset.view = view;
    localStorage.setItem("planner-theme", theme);
    localStorage.setItem("planner-dark-base", darkBase);
    localStorage.setItem("planner-light-base", lightBase);
  }, [theme, darkBase, lightBase, view]);

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
          <p>Plan things what you are got to doing.</p>
        </div>
        <div className="hero-controls">
          <WeekSelector weekStart={weekStart} onShiftWeek={shiftWeek} />
        </div>
      </header>

      <section className={`view-shell view-${view}`}>
        <nav className="view-tabs" aria-label="Planner view selection">
          <button
            type="button"
            onClick={() => setView("habits")}
            className={`view-tab habits ${view === "habits" ? "active" : ""}`}
          >
            Weekly Habits
          </button>
          <button
            type="button"
            onClick={() => setView("weekly")}
            className={`view-tab weekly ${view === "weekly" ? "active" : ""}`}
          >
            Weekly To-Do
          </button>
          <button
            type="button"
            onClick={() => setView("daily")}
            className={`view-tab daily ${view === "daily" ? "active" : ""}`}
          >
            Daily Boards
          </button>
          <button
            type="button"
            onClick={() => setView("settings")}
            className={`view-tab settings ${view === "settings" ? "active" : ""}`}
          >
            Settings
          </button>
        </nav>

        <div className="view-pane">
          <section className="content-stack">
            {view === "habits" && <WeeklyHabitsView habits={planner.habits} />}

            {view === "weekly" && (
              <>
                <TaskComposer onCreateTask={createWeeklyTask} />
                <WeeklyTodoView tasks={planner.weeklyTasks} />
              </>
            )}

            {view === "daily" && <DailyBoardView boards={planner.dailyBoards} />}

            {view === "settings" && (
              <section className="panel settings-pane" aria-label="Appearance settings">
                <h2>Settings</h2>
                <p className="settings-note">Pick a readable color base for each mode and switch instantly.</p>

                <section className="settings-group" aria-label="Theme mode">
                  <h3>Theme</h3>
                  <div className="theme-choice-row">
                    <button
                      type="button"
                      className={theme === "dark" ? "choice active" : "choice"}
                      onClick={() => setTheme("dark")}
                    >
                      Dark
                    </button>
                    <button
                      type="button"
                      className={theme === "light" ? "choice active" : "choice"}
                      onClick={() => setTheme("light")}
                    >
                      Light
                    </button>
                  </div>
                </section>

                <section className="settings-group" aria-label="Dark mode base color">
                  <h3>Dark Base Color</h3>
                  <div className="palette-grid">
                    {darkBaseOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={darkBase === option.value ? "palette-option active" : "palette-option"}
                        onClick={() => setDarkBase(option.value)}
                        data-swatch={option.value}
                        data-tone="dark"
                      >
                        <span>{option.label}</span>
                        <small>{option.hint}</small>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="settings-group" aria-label="Light mode base color">
                  <h3>Light Base Color</h3>
                  <div className="palette-grid">
                    {lightBaseOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={lightBase === option.value ? "palette-option active" : "palette-option"}
                        onClick={() => setLightBase(option.value)}
                        data-swatch={option.value}
                        data-tone="light"
                      >
                        <span>{option.label}</span>
                        <small>{option.hint}</small>
                      </button>
                    ))}
                  </div>
                </section>
              </section>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
