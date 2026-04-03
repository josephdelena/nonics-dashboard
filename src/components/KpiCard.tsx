"use client";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  accent?: boolean;
  warning?: boolean;
  onClick?: () => void;
}

export default function KpiCard({ title, value, subtitle, accent, warning, onClick }: KpiCardProps) {
  return (
    <div
      onClick={onClick}
      className={`glass p-5 ${onClick ? "cursor-pointer" : ""} transition-all duration-200 hover:bg-[rgba(255,255,255,0.06)]`}
      style={warning ? { borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)" } : undefined}
    >
      <p className={`text-[11px] uppercase tracking-widest font-medium mb-2 ${warning ? "text-red-400" : "text-[#6B6B78]"}`}>{title}</p>
      <p className={`text-2xl font-bold ${warning ? "text-red-400" : accent ? "bg-gradient-to-r from-[#F5A623] to-[#F0C040] bg-clip-text text-transparent gold-glow" : "text-[#E8E6E3]"}`}>
        {value}
      </p>
      {subtitle && <p className="text-[#6B6B78] text-xs mt-1.5">{subtitle}</p>}
    </div>
  );
}
