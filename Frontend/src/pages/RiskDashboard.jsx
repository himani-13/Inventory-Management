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

const COLORS = ["#ef4444", "#f59e0b", "#22c55e"];

/* ---------- frontend demo data ---------- */

const fallbackTrend = [
  { month: "Jan", qty: 100 },
  { month: "Feb", qty: 120 },
  { month: "Mar", qty: 150 }
];

const fallbackRisk = [
  { name: "HIGH", value: 4 },
  { name: "MEDIUM", value: 3 },
  { name: "LOW", value: 6 }
];

/*  👉 backend abhi nahi hai to false hi rakho
    baad me sirf true kar dena  */
const USE_API = false;

export default function RiskDashboard() {
  const [trend, setTrend] = useState(fallbackTrend);
  const [riskSplit, setRiskSplit] = useState(fallbackRisk);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!USE_API) return;

    async function load() {
      try {
        setLoading(true);

        const t = await fetch("/api/charts/trend");
        const r = await fetch("/api/charts/risk-split");

        if (!t.ok || !r.ok) throw new Error();

        const trendData = await t.json();
        const riskData = await r.json();

        setTrend(trendData);
        setRiskSplit(riskData);
      } catch {
        setError("Backend not available – showing demo data");
        setTrend(fallbackTrend);
        setRiskSplit(fallbackRisk);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div style={styles.center}>
        <h3>Loading Risk Dashboard...</h3>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Risk & Finance Monitoring</h2>

      {error && (
        <div style={styles.warningBox}>
          {error}
        </div>
      )}

      <div style={styles.grid}>

        {/* ---------- Trend ---------- */}
        <div style={styles.card}>
          <h4>Monthly Risk Transactions Trend</h4>

          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="qty"
                stroke="#2563eb"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ---------- Risk split ---------- */}
        <div style={styles.card}>
          <h4>Risk Category Split</h4>

          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={riskSplit}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={100}
                label
              >
                {riskSplit.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* ---------- KPIs ---------- */}
        <div style={styles.card}>
          <h4>Total Risk Records</h4>
          <p style={styles.bigNumber}>
            {riskSplit.reduce((s, x) => s + x.value, 0)}
          </p>
        </div>

        <div style={styles.card}>
          <h4>High Risk Cases</h4>
          <p style={{ ...styles.bigNumber, color: "#ef4444" }}>
            {riskSplit.find(x => x.name === "HIGH")?.value || 0}
          </p>
        </div>

      </div>
    </div>
  );
}

/* ---------------- UI ---------------- */

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
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
  },
  bigNumber: {
    fontSize: "36px",
    fontWeight: 700,
    marginTop: "10px"
  },
  center: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  warningBox: {
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    color: "#9a3412",
    padding: "10px 14px",
    borderRadius: "6px",
    marginBottom: "14px"
  }
};


