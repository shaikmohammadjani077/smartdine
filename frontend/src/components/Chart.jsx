import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";

const COLORS = ["#ff7a00", "#00f2fe", "#22c55e", "#ef4444", "#fbbf24", "#8b5cf6"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{
        background: "rgba(18, 24, 33, 0.95)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "12px",
        borderRadius: "12px",
        backdropFilter: "blur(8px)",
        boxShadow: "0 10px 25px rgba(0,0,0,0.4)"
      }}>
        <p className="label" style={{ margin: 0, fontWeight: 700, color: "#fff", marginBottom: "4px" }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: 0, color: entry.color, fontSize: "13px" }}>
            {entry.name}: <span style={{ fontWeight: 600 }}>{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Chart({ data, type = "bar", xKey = "restaurantName", yKey = "totalBookings" }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: "300px", display: "grid", placeItems: "center", color: "#667085" }}>
        No data available to display
      </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case "area":
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff7a00" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ff7a00" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey={xKey} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#9aa4b2", fontSize: 11 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#9aa4b2", fontSize: 11 }} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
            <Area type="monotone" dataKey={yKey} stroke="#ff7a00" strokeWidth={3} fillOpacity={1} fill="url(#colorY)" />
          </AreaChart>
        );
      
      case "line":
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey={xKey} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#9aa4b2", fontSize: 11 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#9aa4b2", fontSize: 11 }} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey={yKey} stroke="#ff7a00" strokeWidth={3} dot={{ r: 4, fill: "#ff7a00", strokeWidth: 2, stroke: "#0b0f14" }} activeDot={{ r: 6 }} />
          </LineChart>
        );

      default:
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey={xKey} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#9aa4b2", fontSize: 11 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#9aa4b2", fontSize: 11 }} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
            <Bar dataKey={yKey} radius={[4, 4, 0, 0]} barSize={40}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        );
    }
  };

  return (
    <div style={{ width: "100%", height: "300px", marginTop: "20px" }}>
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
