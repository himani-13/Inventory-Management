const express = require("express");
const router = express.Router();
const db = require("../db");

// Average Forecast (Last 3 months)
router.get("/forecast/:productId", async (req, res) => {

  const { productId } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT DATE_FORMAT(sale_date, '%Y-%m') AS month,
             SUM(quantity) AS total_quantity
      FROM sales
      WHERE product_id = ?
      GROUP BY month
      ORDER BY month DESC
      LIMIT 3
      `,
      [productId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "No sales data found" });
    }

    // Moving Average
    const total = rows.reduce((sum, row) => sum + row.total_quantity, 0);
    const forecast = total / rows.length;

    res.json({
      productId,
      lastMonths: rows,
      movingAverageForecast: Math.round(forecast)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Weighted Average Forecast (Last 3 months)
router.get("/forecastWeighted/:productId", async (req, res) => {
  const { productId } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT DATE_FORMAT(sale_date, '%Y-%m') AS month,
             SUM(quantity) AS total_quantity
      FROM sales
      WHERE product_id = ?
      GROUP BY month
      ORDER BY month ASC
      LIMIT 3
      `,
      [productId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "No sales data found" });
    }

    let weightedSum = 0;
    let totalWeight = 0;

    rows.forEach((row, index) => {
      const weight = index + 1; // oldest = 1, newest = 3
      weightedSum += row.total_quantity * weight;
      totalWeight += weight;
    });

    const forecast = weightedSum / totalWeight;

    res.json({
      productId,
      lastMonths: rows,
      weightedAverageForecast: Math.round(forecast)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Reorder Recommendation
router.get("/reorder/:productId", async (req, res) => {
  const { productId } = req.params;

  try {
    // Get forecast (weighted)
    const [rows] = await db.query(
      `SELECT SUM(quantity) AS total_quantity
       FROM sales
       WHERE product_id = ?`, [productId]
    );

    const forecast = rows[0].total_quantity || 0;

    // Get stock
    const [stockRows] = await db.query(
      `SELECT current_stock, safety_buffer FROM stock WHERE product_id = ?`,
      [productId]
    );

    if (!stockRows.length) {
      return res.status(404).json({ error: "No stock record found" });
    }

    const { current_stock, safety_buffer } = stockRows[0];

    let reorderQty = 0;
    let message = "Stock sufficient ✅";

    if (forecast > current_stock) {
      reorderQty = forecast - current_stock + safety_buffer;
      message = "Reorder recommended 🚨";
    }

    res.json({
      productId,
      current_stock,
      forecast,
      safety_buffer,
      reorderQty,
      message
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;
