"use client";

export type DateRange = "today" | "yesterday" | "week" | "month" | "all" | "custom";

interface Props {
  range: DateRange;
  customFrom: string;
  customTo: string;
  onRangeChange: (range: DateRange) => void;
  onCustomFromChange: (val: string) => void;
  onCustomToChange: (val: string) => void;
}

export default function DateFilter({ range, customFrom, customTo, onRangeChange, onCustomFromChange, onCustomToChange }: Props) {
  const buttons: { label: string; value: DateRange }[] = [
    { label: "Hari Ini", value: "today" },
    { label: "Kemarin", value: "yesterday" },
    { label: "Minggu", value: "week" },
    { label: "Bulan", value: "month" },
    { label: "Semua", value: "all" },
    { label: "Custom", value: "custom" },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
      <div className="flex gap-1 flex-wrap">
        {buttons.map((b) => (
          <button
            key={b.value}
            onClick={() => onRangeChange(b.value)}
            className={`px-3 py-1.5 rounded-[10px] text-[11px] font-medium transition-all ${
              range === b.value
                ? "text-[#06060B] border border-transparent"
                : "border border-[rgba(255,255,255,0.06)] hover:border-[rgba(245,166,35,0.25)] hover:text-[#F5A623]"
            }`}
            style={range === b.value ? { background: "linear-gradient(135deg, #F5A623, #F0C040)" } : { color: "var(--text-muted)" }}
          >
            {b.label}
          </button>
        ))}
      </div>
      {range === "custom" && (
        <div className="flex gap-2 items-center">
          <input type="date" value={customFrom} onChange={(e) => onCustomFromChange(e.target.value)}
            className="bg-[rgba(255,255,255,0.025)] border border-[rgba(245,166,35,0.1)] rounded-[10px] px-2.5 py-1.5 text-xs text-[#F0EDE8] focus:outline-none focus:border-[rgba(245,166,35,0.3)]" />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>&mdash;</span>
          <input type="date" value={customTo} onChange={(e) => onCustomToChange(e.target.value)}
            className="bg-[rgba(255,255,255,0.025)] border border-[rgba(245,166,35,0.1)] rounded-[10px] px-2.5 py-1.5 text-xs text-[#F0EDE8] focus:outline-none focus:border-[rgba(245,166,35,0.3)]" />
        </div>
      )}
    </div>
  );
}
