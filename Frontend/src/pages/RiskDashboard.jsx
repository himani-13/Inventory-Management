import React, { useEffect, useState, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const ALERT_COLORS = {
  CRITICAL: "#dc2626", // red
  WARNING: "#f59e0b",  // yellow
  HEALTHY: "#16a34a",  // green
  OVERSTOCK: "#5f19d8" // purple
};

const fallbackInventory = [
  { item: "Item A", stock: 20, forecast: 100 },
  { item: "Item B", stock: 60, forecast: 100 },
  { item: "Item C", stock: 90, forecast: 100 },
  { item: "Item D", stock: 180, forecast: 100 }
];

const fallbackTrend = [
  { month: "Jan", qty: 100 },
  { month: "Feb", qty: 120 },
  { month: "Mar", qty: 150 }
];

const USE_API = false;

function getRiskStatus(stock, forecast) {
  const percent = (stock / forecast) * 100;

  if (percent < 25)
    return { label: "CRITICAL", color: ALERT_COLORS.CRITICAL, action: "Immediate Reorder" };

  if (percent >= 25 && percent <= 75)
    return { label: "WARNING", color: ALERT_COLORS.WARNING, action: "Review Reorder" };

  if (percent > 150)
    return { label: "OVERSTOCK", color: ALERT_COLORS.OVERSTOCK, action: "Run Discount / Promotion" };

  return { label: "HEALTHY", color: ALERT_COLORS.HEALTHY, action: "No Action" };
}

export default function RiskDashboard() {
  const [inventory, setInventory] = useState(fallbackInventory);
  const [trend, setTrend] = useState(fallbackTrend);

  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!USE_API) return;
  }, []);

  const riskCount = inventory.reduce((acc, item) => {
    const status = getRiskStatus(item.stock, item.forecast).label;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const riskDonutData = Object.keys(riskCount).map(key => ({
    name: key,
    value: riskCount[key],
    fill: ALERT_COLORS[key]
  }));

  const totalRiskRecords = inventory.length;
  const highRiskCases = inventory.filter(
    item => getRiskStatus(item.stock, item.forecast).label === "CRITICAL"
  ).length;

  const totalVsHighData = [
    { name: "High Risk", value: highRiskCases, fill: ALERT_COLORS.CRITICAL },
    { name: "Others", value: totalRiskRecords - highRiskCases, fill: "#e5e7eb" }
  ];

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Risk & Inventory Monitoring</h2>

      <div style={styles.grid}>

        <div style={styles.card}>
          <h4>Monthly Risk Transactions Trend</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="qty" stroke="#2563eb" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.card}>
          <h4>Risk Alert Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={riskDonutData}
                dataKey="value"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
              >
                {riskDonutData.map((e, i) => (
                  <Cell key={i} fill={e.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.card}>
          <h4>Total Risk Overview</h4>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={totalVsHighData}
                dataKey="value"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={2}
              >
                {totalVsHighData.map((e, i) => (
                  <Cell key={i} fill={e.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div style={styles.centerText}>
            <div style={styles.totalNumber}>{totalRiskRecords}</div>
            <div style={styles.subText}>
              High Risk:{" "}
              <span style={{ color: ALERT_COLORS.CRITICAL, fontWeight: 600 }}>
                {highRiskCases}
              </span>
            </div>
          </div>
        </div>

        <div style={{ ...styles.card, gridColumn: "1 / -1" }}>
          <h4>Red Alert Definitions</h4>

          {inventory.map((item, i) => {
            const risk = getRiskStatus(item.stock, item.forecast);
            return (
              <div key={i} style={styles.alertRow}>
                <strong>{item.item}</strong>
                <span>{item.stock} / {item.forecast}</span>
                <span style={{ color: risk.color, fontWeight: 600 }}>
                  {risk.label}
                </span>
                <span>{risk.action}</span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

/* UI STYLES */

const styles = {
  page: {
    padding: "24px",
    background: "#f4f6f8",
    minHeight: "100vh"
  },
  title: {
    marginBottom: "20px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "18px"
  },
  card: {
    background: "#fff",
    borderRadius: "10px",
    padding: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    position: "relative"
  },
  alertRow: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr 1fr 2fr",
    padding: "10px 0",
    borderBottom: "1px solid #eee",
    alignItems: "center"
  },
  centerText: {
    position: "absolute",
    top: "58%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
    pointerEvents: "none"
  },
  totalNumber: {
    fontSize: "34px",
    fontWeight: 700
  },
  subText: {
    fontSize: "14px",
    color: "#555"
  }
};
