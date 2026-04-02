"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";

const COLORS_COD_TF = ["#e07040", "#2ea88a"];
const COLORS_BARS = ["#d9a84e", "#e8c47a", "#b8872e", "#e07040", "#2ea88a", "#4a90d9", "#8b5cf6", "#ef4444", "#06b6d4"];

const tooltipStyle = {
  contentStyle: { backgroundColor: "#1a2547", border: "1px solid #2a3a5c", borderRadius: "8px", color: "#e8eaf0" },
  itemStyle: { color: "#e8eaf0" },
};

interface PieData {
  name: string;
  value: number;
}

export function CodTfPie({ data }: { data: PieData[] }) {
  return (
    <div className="bg-[#141e38] border border-[#2a3a5c] rounded-xl p-5">
      <h3 className="text-[#d9a84e] font-semibold text-sm mb-3">COD vs TF — Orders</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
            {data.map((_, i) => <Cell key={i} fill={COLORS_COD_TF[i % COLORS_COD_TF.length]} />)}
          </Pie>
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ color: "#8892a8", fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface BarData {
  name: string;
  orders: number;
}

export function OrdersBarChart({ data }: { data: BarData[] }) {
  return (
    <div className="bg-[#141e38] border border-[#2a3a5c] rounded-xl p-5">
      <h3 className="text-[#d9a84e] font-semibold text-sm mb-3">Orders per Grup</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5c" />
          <XAxis dataKey="name" tick={{ fill: "#8892a8", fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
          <YAxis tick={{ fill: "#8892a8", fontSize: 11 }} />
          <Tooltip {...tooltipStyle} />
          <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS_BARS[i % COLORS_BARS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface LineData {
  date: string;
  cod: number;
  tf: number;
}

export function TrendLineChart({ data }: { data: LineData[] }) {
  return (
    <div className="bg-[#141e38] border border-[#2a3a5c] rounded-xl p-5">
      <h3 className="text-[#d9a84e] font-semibold text-sm mb-3">Trend Harian — COD vs TF</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a3a5c" />
          <XAxis dataKey="date" tick={{ fill: "#8892a8", fontSize: 11 }} />
          <YAxis tick={{ fill: "#8892a8", fontSize: 11 }} />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ color: "#8892a8", fontSize: 12 }} />
          <Line type="monotone" dataKey="cod" name="COD" stroke="#e07040" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="tf" name="TF" stroke="#2ea88a" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
