export function formatRupiah(val: number): string {
  return `Rp ${val.toLocaleString("id-ID")}`;
}

export function formatNumber(val: number): string {
  return val.toLocaleString("id-ID");
}

export function parseDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  let y: number, m: number, d: number;

  // Handle DD/MM/YYYY
  const slashParts = trimmed.split("/");
  if (slashParts.length === 3) {
    d = parseInt(slashParts[0]);
    m = parseInt(slashParts[1]);
    y = parseInt(slashParts[2]);
  } else {
    // Handle "YYYY-MM-DD HH:MM" or "YYYY-MM-DD" or "DD-MM-YYYY"
    const dateOnly = trimmed.split(" ")[0];
    const dashParts = dateOnly.split("-");
    if (dashParts.length === 3) {
      // Detect DD-MM-YYYY vs YYYY-MM-DD by checking first part length
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
    } else {
      return null; // no fallback to new Date() — reject unknown formats
    }
  }

  // Validate parsed values
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
  if (y < 2020 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;

  return new Date(y, m - 1, d);
}
