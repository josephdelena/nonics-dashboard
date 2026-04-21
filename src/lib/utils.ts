export function formatRupiah(val: number): string {
  return `Rp ${val.toLocaleString("id-ID")}`;
}

export function formatNumber(val: number): string {
  return val.toLocaleString("id-ID");
}

export function formatPercent(numerator: number, denominator: number): string {
  if (!denominator || !isFinite(denominator) || denominator === 0) return "—";
  const pct = (numerator / denominator) * 100;
  if (!isFinite(pct) || isNaN(pct)) return "—";
  return pct.toFixed(2) + "%";
}

const ID_MONTHS: Record<string, number> = {
  januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6,
  juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, agt: 8, sep: 9, okt: 10, nov: 11, des: 12,
};

export function parseDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  let y: number, m: number, d: number;

  // Handle DD/MM/YYYY or D/M/YYYY
  const slashParts = trimmed.split("/");
  if (slashParts.length === 3) {
    d = parseInt(slashParts[0]);
    m = parseInt(slashParts[1]);
    y = parseInt(slashParts[2]);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d) && y >= 2020 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return new Date(y, m - 1, d);
    }
  }

  // Handle dash formats: YYYY-MM-DD or DD-MM-YYYY
  const dateOnly = trimmed.split(" ")[0];
  const dashParts = dateOnly.split("-");
  if (dashParts.length === 3) {
    if (dashParts[0].length <= 2 && dashParts[2].length === 4) {
      // DD-MM-YYYY
      d = parseInt(dashParts[0]);
      m = parseInt(dashParts[1]);
      y = parseInt(dashParts[2]);
    } else {
      // YYYY-MM-DD
      y = parseInt(dashParts[0]);
      m = parseInt(dashParts[1]);
      d = parseInt(dashParts[2]);
    }
    if (!isNaN(y) && !isNaN(m) && !isNaN(d) && y >= 2020 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return new Date(y, m - 1, d);
    }
  }

  // Handle "D MMMM YYYY" or "D MMM YYYY" (Indonesian month names)
  const spaceParts = trimmed.split(/\s+/);
  if (spaceParts.length >= 3) {
    const dayPart = parseInt(spaceParts[0]);
    const monStr = spaceParts[1].toLowerCase().replace(/[^a-z]/g, "");
    const yearPart = parseInt(spaceParts[spaceParts.length - 1]);
    const monNum = ID_MONTHS[monStr];
    if (!isNaN(dayPart) && monNum && !isNaN(yearPart) && yearPart >= 2020 && yearPart <= 2100) {
      return new Date(yearPart, monNum - 1, dayPart);
    }
  }

  // Last resort: native Date parse
  const native = new Date(trimmed);
  if (!isNaN(native.getTime()) && native.getFullYear() >= 2020) {
    return native;
  }

  return null;
}
