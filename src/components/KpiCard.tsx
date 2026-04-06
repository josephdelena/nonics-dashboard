"use client";

import { useRef, useCallback } from "react";

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
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -10;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 10;
    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
  }, []);

  const baseStyle: React.CSSProperties = {
    minWidth: 0,
    flex: flex ?? 1,
    transformStyle: "preserve-3d",
    transition: "transform 0.15s ease-out",
  };
  if (warning) {
    baseStyle.borderColor = "rgba(239,68,68,0.3)";
    baseStyle.background = "rgba(239,68,68,0.06)";
  }
  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`glass p-5 ${onClick ? "cursor-pointer" : ""} hover:bg-[rgba(255,255,255,0.06)] ${className || ""}`}
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
