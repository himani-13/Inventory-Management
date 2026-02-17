import React, { useEffect, useState } from "react";
import StatCard from "../components/StatCard";

export default function ForecastPage() {

  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setError("");
        const res = await fetch("http://localhost:8080/api/products");

        if (!res.ok) {
          throw new Error("Products API failed");
        }

        const json = await res.json();
        setProducts(json);
      } catch (err) {
        console.error(err);
        setError("Backend not reachable (products)");
      }
    };

    loadProducts();
  }, []);

  // load forecast
  const loadForecast = async (p) => {
    setSelected(p);

    if (!p) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `http://localhost:8080/api/forecast?product=${encodeURIComponent(p)}`
      );

      if (!res.ok) {
        throw new Error("Forecast API failed");
      }

      const json = await res.json();
      setData(json);

    } catch (err) {
      console.error(err);
      setError("Backend not reachable (forecast)");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Forecast</h2>

      {error && (
        <div style={{ color: "red", marginBottom: 12 }}>
          {error}
        </div>
      )}

      <select
        value={selected}
        onChange={(e) => loadForecast(e.target.value)}
      >
        <option value="">Select Product</option>
        {products.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {loading && (
        <p style={{ marginTop: 12 }}>Loading forecast...</p>
      )}

      {data && !loading && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 16,
              marginTop: 20
            }}
          >
            <StatCard title="Predicted Demand" value={data.predictedDemand} />
            <StatCard title="Current Stock" value={data.currentStock} />
            <StatCard title="Reorder Quantity" value={data.reorderQty} />
            <StatCard title="Risk Level" value={data.riskLevel} />
          </div>

          <h3 style={{ marginTop: 25 }}>Last Months Sales</h3>

          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Month</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              {(data.history || []).map((x, i) => (
                <tr key={i}>
                  <td>{x.month}</td>
                  <td>{x.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
