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
      className={`rounded-xl p-5 border shadow-sm ${
        warning
          ? "bg-red-50 border-red-200"
          : accent
            ? "bg-[#FFF0ED] border-[#EE4D2D]/20"
            : "bg-white border-[#E8E8E8]"
      } ${onClick ? "cursor-pointer hover:shadow-md transition-all" : ""}`}
    >
      <p className={`text-xs uppercase tracking-wider font-medium ${warning ? "text-red-500" : "text-[#999999]"}`}>{title}</p>
      <p className={`text-2xl font-bold mt-1 ${warning ? "text-red-500" : accent ? "text-[#EE4D2D]" : "text-[#333333]"}`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-[#999999] text-xs mt-1">{subtitle}</p>
      )}
    </div>
  );
}
