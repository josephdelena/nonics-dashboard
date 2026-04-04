"use client";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  accent?: boolean;
  warning?: boolean;
  onClick?: () => void;
  className?: string;
  flex?: number;
}

export default function KpiCard({ title, value, subtitle, accent, warning, onClick, className, flex }: KpiCardProps) {
  const baseStyle: React.CSSProperties = { minWidth: 0, flex: flex ?? 1 };
  if (warning) {
    baseStyle.borderColor = "rgba(239,68,68,0.3)";
    baseStyle.background = "rgba(239,68,68,0.06)";
  }
  return (
    <div
      onClick={onClick}
      className={`glass p-5 ${onClick ? "cursor-pointer" : ""} transition-all duration-200 hover:bg-[rgba(255,255,255,0.06)] ${className || ""}`}
      style={baseStyle}
    >
      <p className={`text-[11px] uppercase tracking-widest font-medium mb-2 ${warning ? "text-red-400" : "text-[#6B6B78]"}`}>{title}</p>
      <p className={`font-bold ${warning ? "text-red-400" : accent ? "bg-gradient-to-r from-[#F5A623] to-[#F0C040] bg-clip-text text-transparent gold-glow" : "text-[#E8E6E3]"}`}
        style={{ fontSize: "clamp(0.85rem, 1.4vw, 1.25rem)" }}>
        {value}
      </p>
      {subtitle && <p className="text-[#6B6B78] text-xs mt-1.5">{subtitle}</p>}
    </div>
  );
}
