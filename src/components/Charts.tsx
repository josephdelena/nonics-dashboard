"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";

const COLORS_COD_TF = ["#F5A623", "#22C55E"];
const COLORS_BARS = ["#F5A623", "#F0C040", "#D4942A", "#22C55E", "#4A90D9", "#8B5CF6", "#EC4899", "#06B6D4", "#EF4444"];
const tooltipStyle = {
  contentStyle: { backgroundColor: "#1A1A25", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#E8E6E3", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" },
  itemStyle: { color: "#E8E6E3" },
};

interface PieData { name: string; value: number; }
export function CodTfPie({ data }: { data: PieData[] }) {
  return (
    <div className="glass p-5">
      <h3 className="bg-gradient-to-r from-[#F5A623] to-[#F0C040] bg-clip-text text-transparent font-semibold text-sm mb-3">COD vs TF</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
            {data.map((_, i) => <Cell key={i} fill={COLORS_COD_TF[i % COLORS_COD_TF.length]} />)}
          </Pie>
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ color: "#6B6B78", fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface BarData { name: string; orders: number; }
export function OrdersBarChart({ data }: { data: BarData[] }) {
  return (
    <div className="glass p-5">
      <h3 className="bg-gradient-to-r from-[#F5A623] to-[#F0C040] bg-clip-text text-transparent font-semibold text-sm mb-3">Orders per Grup</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="name" tick={{ fill: "#6B6B78", fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
          <YAxis tick={{ fill: "#6B6B78", fontSize: 11 }} />
          <Tooltip {...tooltipStyle} />
          <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS_BARS[i % COLORS_BARS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface LineData { date: string; cod: number; tf: number; }
export function TrendLineChart({ data }: { data: LineData[] }) {
  return (
    <div className="glass p-5">
      <h3 className="bg-gradient-to-r from-[#F5A623] to-[#F0C040] bg-clip-text text-transparent font-semibold text-sm mb-3">Trend Harian</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="date" tick={{ fill: "#6B6B78", fontSize: 11 }} />
          <YAxis tick={{ fill: "#6B6B78", fontSize: 11 }} />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ color: "#6B6B78", fontSize: 12 }} />
          <Line type="monotone" dataKey="cod" name="COD" stroke="#F5A623" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="tf" name="TF" stroke="#22C55E" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
