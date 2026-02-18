const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/reorder/:productId", async (req, res) => {
  const { productId } = req.params;

  try {
    const [stockRows] = await db.query(
      `SELECT current_stock, safety_buffer FROM Stock WHERE product_id = ?`,
      [productId]
    );

    if (stockRows.length === 0) {
      return res.status(404).json({ error: "Product stock not found" });
    }

    const { current_stock, safety_buffer } = stockRows[0];

    const [salesRows] = await db.query(
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

    let forecast = 0;
    
    if (salesRows.length > 0) {
      const chronologicalSales = salesRows.reverse(); 
      
      let weightedSum = 0;
      let totalWeight = 0;

      chronologicalSales.forEach((row, index) => {
        const weight = index + 1; 
        weightedSum += row.total_quantity * weight;
        totalWeight += weight;
      });

      forecast = Math.round(weightedSum / totalWeight);
    }

    if (forecast === 0) {
       return res.json({
         productId,
         current_stock,
         forecast: 0,
         risk_level: "No Sales Data",
         color: "Grey",
         action: "N/A"
       });
    }

    let riskLevel = "";
    let color = "";
    let action = "";
    let reorder_quantity = 0;

    // Calculate Stock Coverage Percentage
    const coverage = (current_stock / forecast) * 100;

    if (coverage < 25) {
      riskLevel = "Critical Low Stock";
      color = "Red";
      action = "Reorder Immediately";
      reorder_quantity = (forecast + safety_buffer) - current_stock;

    } else if (coverage >= 25 && coverage <= 75) {
      riskLevel = "Moderate Risk";
      color = "Yellow";
      action = "Review Orders";
      reorder_quantity = Math.max(0, forecast - current_stock);

    } else if (coverage > 150) {
      riskLevel = "Overstock";
      color = "Blue";
      action = "Run Discount / Clearance";
      reorder_quantity = 0;

    } else {
      riskLevel = "Safe Stock";
      color = "Green";
      action = "No Action Required";
      reorder_quantity = 0;
    }

    // 5. SEND RESPONSE
    res.json({
      product_id: productId,
      metrics: {
        current_stock,
        safety_buffer,
        predicted_demand_next_month: forecast,
        stock_coverage_percent: Math.round(coverage) + "%"
      },
      status: {
        risk: riskLevel,
        color_code: color,
        recommended_action: action,
        suggested_reorder_qty: reorder_quantity
      }
    });

  } catch (error) {
    console.error("Reorder Logic Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;