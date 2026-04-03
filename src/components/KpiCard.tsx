"use client";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  accent?: boolean;
  warning?: boolean;
}

export default function KpiCard({ title, value, subtitle, accent, warning }: KpiCardProps) {
  return (
    <div className={`rounded-xl p-5 border ${
      warning
        ? "bg-red-950/30 border-red-500/30"
        : accent
          ? "bg-gradient-to-br from-[#2a3a5c] to-[#1a2547] border-[#d9a84e]/30"
          : "bg-[#141e38] border-[#2a3a5c]"
    }`}>
      <p className={`text-xs uppercase tracking-wider font-medium ${warning ? "text-red-400" : "text-[#8892a8]"}`}>{title}</p>
      <p className={`text-2xl font-bold mt-1 ${warning ? "text-red-400" : accent ? "text-[#d9a84e]" : "text-[#e8eaf0]"}`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-[#8892a8] text-xs mt-1">{subtitle}</p>
      )}
    </div>
  );
}
