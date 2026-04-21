import { formatHumanDate, getWeekDates } from "../lib/date";

interface WeekSelectorProps {
  weekStart: Date;
  onShiftWeek: (days: number) => void;
}

export function WeekSelector({ weekStart, onShiftWeek }: WeekSelectorProps) {
  const dates = getWeekDates(weekStart);

  return (
    <section className="week-selector">
      <button onClick={() => onShiftWeek(-7)} aria-label="Previous week">Previous</button>
      <div className="week-range">
        <span className="week-range-start">
          <strong>{formatHumanDate(dates[0])}</strong>
          <span className="week-range-to"> to</span>
        </span>
        <strong>{formatHumanDate(dates[6])}</strong>
      </div>
      <button onClick={() => onShiftWeek(7)} aria-label="Next week">Next</button>
    </section>
  );
}
