import React from "react";

export default function StatCard({ title, value }) {
  return (
    <div style={{
      padding: 16,
      borderRadius: 10,
      background: "#fff",
      boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
    }}>
      <div style={{ fontSize: 13, color: "#777" }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: "bold" }}>{value}</div>
    </div>
  );
}