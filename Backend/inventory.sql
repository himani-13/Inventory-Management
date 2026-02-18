show databases;
create database inventory;
use inventory;
CREATE TABLE Products(
	id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
	created_at TIMESTAMP DEFAULT current_timestamp
);
CREATE TABLE Stock(
	id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
     current_stock INT NOT NULL DEFAULT 0,
    safety_buffer INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE
);
CREATE TABLE sales (
    id INT PRIMARY KEY AUTO_INCREMENT,

    sale_date DATE NOT NULL,
    product_id INT NOT NULL,

    region VARCHAR(100) NOT NULL,
    channel VARCHAR(50) NOT NULL,

    quantity INT NOT NULL,
    sales DECIMAL(12,2) NOT NULL,
    cost DECIMAL(12,2) NOT NULL,
    profit DECIMAL(12,2) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE
);
CREATE INDEX idx_product_date 
ON sales(product_id, sale_date);

SELECT COUNT(*) FROM Products;


SELECT * from Products;
SELECT * from sales;
