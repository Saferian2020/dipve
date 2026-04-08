export function getStartOfCurrentWeek() {
  const today = new Date();
  const day = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function getStartOfCurrentMonth() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
}

export function getEndOfToday() {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
}

export function isInRange(fecha, desde, hasta) {
  if (!fecha) return false;
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  return d >= desde && d <= hasta;
}
