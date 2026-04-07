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
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              range === b.value
                ? "bg-gradient-to-r from-[#F5A623] to-[#F0C040] text-[#0A0A0F]"
                : "text-[#6B6B78] border border-[rgba(255,255,255,0.08)] hover:border-[#F5A623]/30 hover:text-[#F5A623]"
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>
      {range === "custom" && (
        <div className="flex gap-2 items-center">
          <input type="date" value={customFrom} onChange={(e) => onCustomFromChange(e.target.value)}
            className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-lg px-2 py-1.5 text-xs text-[#E8E6E3] focus:outline-none focus:border-[#F5A623]" />
          <span className="text-[#6B6B78] text-xs">&mdash;</span>
          <input type="date" value={customTo} onChange={(e) => onCustomToChange(e.target.value)}
            className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-lg px-2 py-1.5 text-xs text-[#E8E6E3] focus:outline-none focus:border-[#F5A623]" />
        </div>
      )}
    </div>
  );
}
