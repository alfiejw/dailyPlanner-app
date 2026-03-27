// Compute week start (Monday) for a supplied date.
export function getWeekStart(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);

  const day = normalized.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  normalized.setDate(normalized.getDate() + mondayOffset);

  return normalized;
}

// Build seven dates from a Monday week start.
export function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }).map((_, index) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + index);
    return day;
  });
}

export function formatHumanDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  });
}
