const express = require("express");
const router = express.Router();
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const db = require("../db");

const upload = multer({
  dest: "uploads/"
});

router.post("/upload", upload.single("file"), (req, res) => {

  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {

      console.log("CSV rows loaded:", results.length);

      const connection = await db.getConnection();

      try {
        await connection.beginTransaction();
        console.log("Transaction started");

        for (const row of results) {

          const {
            Date,
            Product,
            Region,
            Channel,
            Quantity,
            Sales,
            Cost,
            Profit
          } = row;

          let formattedDate = null;

          if (Date && Date.includes("-")) {
            const [day, month, year] = Date.split("-");
            formattedDate = `${year}-${month}-${day}`;
          }

          // Check products
          let [productRows] = await connection.query(
            "SELECT id FROM products WHERE name = ?",
            [Product]
          );

          let productId;

          if (productRows.length === 0) {
            const [insertProduct] = await connection.query(
              "INSERT INTO products (name) VALUES (?)",
              [Product]
            );
            productId = insertProduct.insertId;

            // Insert Stock row
            await connection.query(
              "INSERT INTO stock (product_id, current_stock, safety_buffer) VALUES (?, 0, 50)",
              [productId]
            );
          } else {
            productId = productRows[0].id;
          }

          // Insert sales record
          await connection.query(
            `INSERT INTO sales 
            (sale_date, product_id, region, channel, quantity, sales, cost, profit)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              formattedDate,
              productId,
              Region || null,
              Channel || null,
              Number(Quantity) || 0,
              Number(Sales) || 0,
              Number(Cost) || 0,
              Number(Profit) || 0
            ]
          );
        }

        await connection.commit();
        console.log("Transaction committed successfully");

        res.json({
          message: "Data inserted successfully",
          totalRows: results.length
        });

      } catch (error) {
        await connection.rollback();
        console.error("DB ERROR:", error);
        res.status(500).json({ error: error.message });
      } finally {
        connection.release();
        fs.unlinkSync(req.file.path);
      }
    });
});

module.exports = router;
