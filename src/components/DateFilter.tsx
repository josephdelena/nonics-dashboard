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
    { label: "Minggu Ini", value: "week" },
    { label: "Bulan Ini", value: "month" },
    { label: "Semua", value: "all" },
    { label: "Custom", value: "custom" },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="flex gap-1.5 flex-wrap">
        {buttons.map((b) => (
          <button
            key={b.value}
            onClick={() => onRangeChange(b.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              range === b.value
                ? "bg-[#EE4D2D] text-white"
                : "bg-white text-[#666666] border border-[#E8E8E8] hover:border-[#EE4D2D]/50"
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>
      {range === "custom" && (
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => onCustomFromChange(e.target.value)}
            className="bg-white border border-[#E8E8E8] rounded-lg px-2 py-1.5 text-xs text-[#333333] focus:outline-none focus:border-[#EE4D2D]"
          />
          <span className="text-[#999999] text-xs">&mdash;</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => onCustomToChange(e.target.value)}
            className="bg-white border border-[#E8E8E8] rounded-lg px-2 py-1.5 text-xs text-[#333333] focus:outline-none focus:border-[#EE4D2D]"
          />
        </div>
      )}
    </div>
  );
}
