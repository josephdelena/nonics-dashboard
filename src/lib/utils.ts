export function formatRupiah(val: number): string {
  return `Rp ${val.toLocaleString("id-ID")}`;
}

export function formatNumber(val: number): string {
  return val.toLocaleString("id-ID");
}

export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  // Handle DD/MM/YYYY
  const slashParts = dateStr.split("/");
  if (slashParts.length === 3) {
    const [day, month, year] = slashParts;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  // Handle "YYYY-MM-DD HH:MM" or "YYYY-MM-DD" — strip time part for date-only comparison
  const dateOnly = dateStr.split(" ")[0];
  const dashParts = dateOnly.split("-");
  if (dashParts.length === 3) {
    const [year, month, day] = dashParts;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}
