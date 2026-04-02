export function formatRupiah(val: number): string {
  return `Rp ${val.toLocaleString("id-ID")}`;
}

export function formatNumber(val: number): string {
  return val.toLocaleString("id-ID");
}

export function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  // Handle DD/MM/YYYY or YYYY-MM-DD
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}
