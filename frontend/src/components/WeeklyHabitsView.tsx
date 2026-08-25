interface WeeklyHabitsViewProps {
  habits: Record<string, boolean[]>;
}

const dayHeaders = [
  { one: "M", two: "Mo", three: "Mon", long: "Monday" },
  { one: "T", two: "Tu", three: "Tue", long: "Tuesday" },
  { one: "W", two: "We", three: "Wed", long: "Wednesday" },
  { one: "T", two: "Th", three: "Thu", long: "Thursday" },
  { one: "F", two: "Fr", three: "Fri", long: "Friday" },
  { one: "S", two: "Sa", three: "Sat", long: "Saturday" },
  { one: "S", two: "Su", three: "Sun", long: "Sunday" }
];

export function WeeklyHabitsView({ habits }: WeeklyHabitsViewProps) {
  return (
    <section className="panel">
      <h2>Weekly Habits</h2>
      <table className="habit-table">
        <thead>
          <tr>
            <th scope="col">Habit</th>
            {dayHeaders.map((day) => (
              <th key={day.long} scope="col">
                <span className="day-label-long">{day.long}</span>
                <span className="day-label-three">{day.three}</span>
                <span className="day-label-two">{day.two}</span>
                <span className="day-label-one">{day.one}</span>
              </th>
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
