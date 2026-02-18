const express = require("express");
const router = express.Router();
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const db = require("../db"); 

const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      console.log(`Processing ${results.length} rows...`);

      const connection = await db.getConnection();

      try {
        await connection.beginTransaction();

        for (const row of results) {
          const {
            Date,
            Region,
            Product,
            Channel,
            Units_Sold,    
            Revenue,       
            Cost,
            Profit
          } = row;

          let formattedDate = null;
          if (Date) {
            if (Date.includes("-")) {
              const [day, month, year] = Date.split("-");
              formattedDate = `${year}-${month}-${day}`;
            } else if (Date.includes("/")) {
               const [day, month, year] = Date.split("/");
               formattedDate = `${year}-${month}-${day}`;
            }
          }

         
          // We check if the product exists to get its ID
          const [productRows] = await connection.query(
            "SELECT id FROM Products WHERE name = ?", 
            [Product]
          );

          let productId;

          if (productRows.length === 0) {
            // Create new product
            const [insertResult] = await connection.query(
              "INSERT INTO Products (name) VALUES (?)",
              [Product]
            );
            productId = insertResult.insertId;

            // Initialize Stock for new product
            await connection.query(
              "INSERT INTO Stock (product_id, current_stock, safety_buffer) VALUES (?, 0, 50)",
              [productId]
            );
          } else {
            productId = productRows[0].id;
          }

         
          await connection.query(
            `INSERT INTO sales 
            (sale_date, product_id, region, channel, quantity, sales, cost, profit)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              formattedDate,
              productId,
              Region,
              Channel,
              Number(Units_Sold) || 0,  
              Number(Revenue) || 0,     
              Number(Cost) || 0,
              Number(Profit) || 0
            ]
          );
        }

        await connection.commit();
        console.log("Transaction committed.");
        res.json({ message: "Data inserted successfully", totalRows: results.length });

      } catch (error) {
        await connection.rollback();
        console.error("DB Transaction Error:", error);
        res.status(500).json({ error: "Database error during upload." });
      } finally {
        connection.release();
        if (req.file && req.file.path) fs.unlinkSync(req.file.path);
      }
    });
});

module.exports = router;