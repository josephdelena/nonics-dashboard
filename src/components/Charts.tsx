"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";

const COLORS_COD_TF = ["#EE4D2D", "#2EA88A"];
const COLORS_BARS = ["#EE4D2D", "#FF6E4A", "#FF9A7B", "#D73211", "#2EA88A", "#4A90D9", "#8B5CF6", "#F59E0B", "#06B6D4"];

const tooltipStyle = {
  contentStyle: { backgroundColor: "#FFFFFF", border: "1px solid #E8E8E8", borderRadius: "8px", color: "#333333", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" },
  itemStyle: { color: "#333333" },
};

interface PieData {
  name: string;
  value: number;
}

export function CodTfPie({ data }: { data: PieData[] }) {
  return (
    <div className="bg-white border border-[#E8E8E8] rounded-xl p-5 shadow-sm">
      <h3 className="text-[#EE4D2D] font-semibold text-sm mb-3">COD vs TF — Orders</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
            {data.map((_, i) => <Cell key={i} fill={COLORS_COD_TF[i % COLORS_COD_TF.length]} />)}
          </Pie>
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ color: "#666666", fontSize: 12 }} />
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
    <div className="bg-white border border-[#E8E8E8] rounded-xl p-5 shadow-sm">
      <h3 className="text-[#EE4D2D] font-semibold text-sm mb-3">Orders per Grup</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
          <XAxis dataKey="name" tick={{ fill: "#999999", fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
          <YAxis tick={{ fill: "#999999", fontSize: 11 }} />
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
    <div className="bg-white border border-[#E8E8E8] rounded-xl p-5 shadow-sm">
      <h3 className="text-[#EE4D2D] font-semibold text-sm mb-3">Trend Harian — COD vs TF</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
          <XAxis dataKey="date" tick={{ fill: "#999999", fontSize: 11 }} />
          <YAxis tick={{ fill: "#999999", fontSize: 11 }} />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ color: "#666666", fontSize: 12 }} />
          <Line type="monotone" dataKey="cod" name="COD" stroke="#EE4D2D" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="tf" name="TF" stroke="#2EA88A" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
