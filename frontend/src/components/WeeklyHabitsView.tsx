interface WeeklyHabitsViewProps {
  habits: Record<string, boolean[]>;
}

const dayHeaders = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeeklyHabitsView({ habits }: WeeklyHabitsViewProps) {
  return (
    <section className="panel">
      <h2>Weekly Habits</h2>
      <table className="habit-table">
        <thead>
          <tr>
            <th>Habit</th>
            {dayHeaders.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(habits).map(([habitName, ticks]) => (
            <tr key={habitName}>
              <td>{habitName}</td>
              {ticks.map((done, index) => (
                <td key={`${habitName}-${index}`}>{done ? "x" : "-"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
