export function formatDayLabel(createdAt?: string): string {
  if (!createdAt) {
    return "";
  }
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfMessageDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfMessageDay.getTime()) / 86400000);

  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === 1) {
    return "Yesterday";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: startOfMessageDay.getFullYear() === startOfToday.getFullYear() ? undefined : "numeric"
  });
}
