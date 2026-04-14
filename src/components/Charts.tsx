"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ComposedChart, Line, Area,
} from "recharts";
import { formatRupiah, formatNumber } from "@/lib/utils";

const tooltipStyle = {
  contentStyle: { backgroundColor: "rgba(10,10,15,0.95)", backdropFilter: "blur(20px)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: "12px", color: "#E8E6E3", boxShadow: "0 20px 60px rgba(0,0,0,0.8)" },
  itemStyle: { color: "#E8E6E3" },
};

/* ── COD vs TF Pie ── */
const COLORS_COD_TF = ["#F5A623", "#22C55E"];
interface PieData { name: string; value: number; }
export function CodTfPie({ data }: { data: PieData[] }) {
  return (
    <div className="glass-gold p-5">
      <h3 className="bg-gradient-to-r from-[#F5A623] to-[#F0C040] bg-clip-text text-transparent font-semibold text-sm mb-3">COD vs TF</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
            {data.map((_, i) => <Cell key={i} fill={COLORS_COD_TF[i % COLORS_COD_TF.length]} />)}
          </Pie>
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ color: "#6B6B78", fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Orders per Grup — Stacked Bar (COD + TF) ── */
interface StackedBarData { name: string; cod: number; tf: number; total: number; }

function splitName(name: string): string[] {
  const parts = name.replace(/-/g, " ").split(/\s+/);
  if (parts.length <= 1) return parts;
  const mid = Math.ceil(parts.length / 2);
  return [parts.slice(0, mid).join(" "), parts.slice(mid).join(" ")];
}

function StackedBarLabel({ x, y, width, value }: { x: number; y: number; width: number; value: number }) {
  if (!value) return null;
  return (
    <text x={x + width / 2} y={y + 14} textAnchor="middle" fill="#fff" fontSize={10} fontWeight={600}>
      {value}
    </text>
  );
}

function TotalBadge({ x, y, width, value }: { x?: number; y?: number; width?: number; value?: number }) {
  if (x == null || y == null || width == null || !value) return null;
  return (
    <text x={x + width / 2} y={y - 6} textAnchor="middle" fill="#E8E6E3" fontSize={11} fontWeight={700}>
      {value}
    </text>
  );
}

function MultiLineTick({ x, y, payload }: { x: number; y: number; payload: { value: string } }) {
  const lines = splitName(payload.value);
  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, i) => (
        <text key={i} x={0} y={i * 13} textAnchor="middle" fill="#6B6B78" fontSize={10}>
          {line}
        </text>
      ))}
    </g>
  );
}

export function OrdersBarChart({ data }: { data: StackedBarData[] }) {
  return (
    <div className="glass-gold p-5">
      <h3 className="bg-gradient-to-r from-[#F5A623] to-[#F0C040] bg-clip-text text-transparent font-semibold text-sm mb-3">Orders per Grup</h3>
      <div className="flex items-center gap-4 mb-3">
        <span className="flex items-center gap-1.5 text-[10px] text-[#6B6B78]"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#F5A623" }} />COD</span>
        <span className="flex items-center gap-1.5 text-[10px] text-[#6B6B78]"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#22C55E" }} />TF</span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 20, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,166,35,0.04)" horizontal={true} vertical={false} />
          <XAxis dataKey="name" tick={MultiLineTick as any} interval={0} tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} height={40} />
          <YAxis tick={{ fill: "#6B6B78", fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip {...tooltipStyle} formatter={(value: any, name: any) => [value, name === "cod" ? "COD" : "TF"]} />
          <Bar dataKey="cod" stackId="a" fill="#F5A623" radius={[0, 0, 0, 0]} />
          <Bar dataKey="tf" stackId="a" fill="#22C55E" radius={[4, 4, 0, 0]} label={<StackedBarLabel x={0} y={0} width={0} value={0} />}>
            {data.map((entry, i) => (
              <Cell key={i} />
            ))}
          </Bar>
          {/* Total badge on top */}
          <Bar dataKey="total" stackId="b" fill="transparent" radius={[0, 0, 0, 0]} label={<TotalBadge />} hide />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Total Sales per Hari — Combo Chart ── */
interface ComboData { date: string; sales: number; orders: number; }
interface TrendProps { data: ComboData[]; totalSales: number; totalOrders: number; avgOrderValue: number; dateLabel?: string; }

function formatDateLabel(dateStr: string): string {
  if (!dateStr) return "";
  const dashParts = dateStr.split("-");
  if (dashParts.length === 3) {
    const day = parseInt(dashParts[2]);
    const month = parseInt(dashParts[1]);
    if (!isNaN(day) && !isNaN(month)) return `${day}/${month}`;
  }
  const slashParts = dateStr.split("/");
  if (slashParts.length === 3) {
    const day = parseInt(slashParts[0]);
    const month = parseInt(slashParts[1]);
    if (!isNaN(day) && !isNaN(month)) return `${day}/${month}`;
  }
  return "";
}

function ComboTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const isLast = payload[0]?.payload?._isToday;
  return (
    <div style={{
      background: "rgba(10,10,15,0.95)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(245,166,35,0.2)",
      borderRadius: "12px",
      padding: "12px 16px",
      boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
    }}>
      <p style={{ color: "#9B9BA8", fontSize: 11, marginBottom: 6, fontWeight: 500 }}>
        {formatDateLabel(label)} {isLast && <span style={{ color: "#F5A623", fontWeight: 700 }}> — Hari ini</span>}
      </p>
      {payload.filter((p: any) => p.dataKey !== "_hidden").map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, fontSize: 13, margin: "3px 0", fontWeight: 600 }}>
          {p.name === "sales" ? "Sales" : "Orders"}: {p.name === "sales" ? formatRupiah(p.value) : formatNumber(p.value)}
        </p>
      ))}
    </div>
  );
}

function OrderDot({ cx, cy, index, dataLength }: { cx: number; cy: number; index: number; dataLength: number }) {
  const isToday = index === dataLength - 1;
  const showDot = isToday || index % 5 === 0;
  if (!showDot) return null;
  return (
    <g>
      {isToday && <circle cx={cx} cy={cy} r={10} fill="#22C55E" opacity={0.15} />}
      <circle cx={cx} cy={cy} r={isToday ? 5 : 3} fill="#22C55E" stroke={isToday ? "#E8E6E3" : "rgba(90,180,104,0.4)"} strokeWidth={isToday ? 2.5 : 1} />
    </g>
  );
}

export function TrendLineChart({ data, totalSales, totalOrders, avgOrderValue, dateLabel }: TrendProps) {
  const enriched = data.map((d, i) => ({ ...d, _isToday: i === data.length - 1 }));
  const dataLen = enriched.length;

  const subtitle = dateLabel ?? (dataLen > 0
    ? `${formatDateLabel(data[0].date)} – ${formatDateLabel(data[dataLen - 1].date)} (${dataLen} hari)`
    : "");

  return (
    <div className="glass-gold p-5 col-span-1 md:col-span-2 lg:col-span-3">
      {/* Header + Summary */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-5 gap-4">
        <div>
          <h3 className="bg-gradient-to-r from-[#F5A623] to-[#F0C040] bg-clip-text text-transparent font-bold text-base tracking-tight">Total Sales per Hari</h3>
          <p className="text-[11px] text-[#6B6B78] mt-0.5">{subtitle}</p>
        </div>
        <div className="flex gap-5 flex-wrap">
          <div className="text-right">
            <p className="text-[10px] text-[#6B6B78] uppercase tracking-widest font-medium">Total Sales</p>
            <p className="text-lg font-bold text-[#F5A623] leading-tight mt-0.5">{formatRupiah(totalSales)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#6B6B78] uppercase tracking-widest font-medium">Total Orders</p>
            <p className="text-lg font-bold text-[#22C55E] leading-tight mt-0.5">{formatNumber(totalOrders)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#6B6B78] uppercase tracking-widest font-medium">Avg Order Value</p>
            <p className="text-lg font-bold text-[#E8E6E3] leading-tight mt-0.5">{formatRupiah(avgOrderValue)}</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-4">
        <span className="flex items-center gap-2 text-[11px] text-[#9B9BA8] font-medium">
          <span className="w-3 h-3 rounded-[3px]" style={{ background: "linear-gradient(180deg, #F5A623, rgba(245,166,35,0.4))" }} />
          Sales (Rp)
        </span>
        <span className="flex items-center gap-2 text-[11px] text-[#9B9BA8] font-medium">
          <span className="w-6 h-[3px] rounded-full" style={{ background: "#22C55E" }} />
          Orders
        </span>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={enriched} margin={{ top: 10, right: 8, bottom: 0, left: -4 }}>
          <defs>
            <linearGradient id="salesBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5A623" stopOpacity={1} />
              <stop offset="100%" stopColor="#F5A623" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="ordersAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C55E" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,166,35,0.04)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateLabel}
            tick={{ fill: "#6B6B78", fontSize: 10, fontWeight: 500 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            interval={dataLen > 20 ? Math.floor(dataLen / 8) : 0}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: "#6B6B78", fontSize: 10, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}jt` : v >= 1000 ? `${(v / 1000).toFixed(0)}rb` : String(v)}
            label={{ value: "Sales (Rp)", angle: -90, position: "insideLeft", offset: 10, style: { fill: "#6B6B78", fontSize: 9, fontWeight: 500 } }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "#22C55E", fontSize: 10, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            label={{ value: "Orders", angle: 90, position: "insideRight", offset: 10, style: { fill: "#22C55E", fontSize: 9, fontWeight: 500 } }}
          />
          <Tooltip content={<ComboTooltip />} cursor={{ fill: "rgba(245,166,35,0.06)" }} />
          <Bar yAxisId="left" dataKey="sales" fill="url(#salesBarGrad)" radius={[4, 4, 0, 0]} barSize={dataLen > 20 ? 10 : 18} />
          <Area yAxisId="right" dataKey="orders" fill="url(#ordersAreaGrad)" stroke="none" type="monotone" />
          <Line
            yAxisId="right"
            dataKey="orders"
            stroke="#22C55E"
            strokeWidth={2.5}
            type="monotone"
            dot={(props: any) => <OrderDot key={props.index} cx={props.cx} cy={props.cy} index={props.index} dataLength={dataLen} />}
            activeDot={{ r: 6, fill: "#22C55E", stroke: "#E8E6E3", strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
