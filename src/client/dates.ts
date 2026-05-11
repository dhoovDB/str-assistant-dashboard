// new Date("2026-05-10") parses as UTC midnight, then formats in local TZ —
// in any zone west of UTC the displayed day is wrong. Build the Date in local
// time from the parts instead.
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
