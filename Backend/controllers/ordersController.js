import db from "../config/db.js";

// 1. Ambil List Transaksi (Master)
export const getOrders = (req, res) => {
  // Menampilkan daftar transaksi global
  const sql = `
        SELECT 
            o.ORDER_ID as id, 
            o.ORDER_DATE as tanggal, 
            o.TOTAL as total, 
            o.CUST_ID as cust_id,
            o.USER_ID as user_id,
            o.METHOD_ID as method_id,
            IF(o.CUST_ID = '-NoName-', 'Pelanggan Umum', COALESCE(c.CUST_NAME, o.CUST_ID)) as pelanggan, 
            k.USERNAME as kasir,
            pm.METHOD as metode_pembayaran,
            o.BANK_TRANS as bank,
            o.RECEIPT_NUMBER as nomor_nota
        FROM orders o
        LEFT JOIN customers c ON o.CUST_ID = c.CUST_ID
        LEFT JOIN cashiers k ON o.USER_ID = k.USER_ID
        LEFT JOIN payment_methods pm ON o.METHOD_ID = pm.METHOD_ID
        ORDER BY o.ORDER_DATE DESC
    `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Data Riwayat Transaksi", data: results });
  });
};

// 2. Update Transaksi
export const updateOrder = (req, res) => {
  const { id } = req.params;
  const { total, methodId, bank, receipt } = req.body;

  const sql = `UPDATE orders SET TOTAL = ?, METHOD_ID = ?, BANK_TRANS = ?, RECEIPT_NUMBER = ? WHERE ORDER_ID = ?`;
  db.query(sql, [total, methodId, bank, receipt, id], (err, result) => {
    if (err)
      return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, message: "Transaksi diperbarui" });
  });
};

// 3. Delete Transaksi
export const deleteOrder = (req, res) => {
  const { id } = req.params;

  // Hapus detail dulu karena ada Foreign Key
  const deleteDetailsSql = `DELETE FROM order_details WHERE ORDER_ID = ?`;
  db.query(deleteDetailsSql, [id], (err) => {
    if (err)
      return res.status(500).json({ success: false, message: err.message });

    const deleteOrderSql = `DELETE FROM orders WHERE ORDER_ID = ?`;
    db.query(deleteOrderSql, [id], (err) => {
      if (err)
        return res.status(500).json({ success: false, message: err.message });
      res.json({ success: true, message: "Transaksi dihapus" });
    });
  });
};

// 4. Ambil Detail Item per Transaksi (Detail)
// Ini dipanggil saat Admin meng-klik salah satu order
export const getOrderDetails = (req, res) => {
  const { id } = req.params; // Ini adalah ORDER_ID

  // Kita JOIN tabel order_details dengan products
  // Agar tahu ID sekian itu nama kopinya apa
  const sql = `
        SELECT 
            p.PRODUCT_NAME, 
            p.CATEGORY_ID,
            od.PRICE as HARGA_SATUAN,
            od.QTY,
            (od.PRICE * od.QTY) as SUBTOTAL
        FROM order_details od
        JOIN products p ON od.PRODUCT_ID = p.PRODUCT_ID
        WHERE od.ORDER_ID = ?
    `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: `Detail Item untuk Order #${id}`, data: results });
  });
};

export const getDashboardStats = (req, res) => {
  const sql = `
        SELECT 
            (SELECT COUNT(*) FROM customers) as totalCustomers,
            (SELECT SUM(QTY) FROM order_details) as totalProductsSold,
            (SELECT COUNT(*) FROM orders) as totalOrders
    `;

  db.query(sql, (err, stats) => {
    if (err) return res.status(500).json({ message: err.message });

    // Latest 5 transactions for dashboard
    const latestSql = `
            SELECT 
                o.ORDER_ID as id, 
                o.ORDER_DATE as tanggal, 
                IF(o.CUST_ID = '-NoName-', 'Pelanggan Umum', COALESCE(c.CUST_NAME, o.CUST_ID)) as pelanggan, 
                k.USERNAME as kasir, 
                o.TOTAL as total, 
                pm.METHOD as metode_pembayaran, 
                o.BANK_TRANS as bank, 
                o.RECEIPT_NUMBER as nomor_nota
            FROM orders o 
            LEFT JOIN customers c ON o.CUST_ID = c.CUST_ID 
            LEFT JOIN cashiers k ON o.USER_ID = k.USER_ID
            LEFT JOIN payment_methods pm ON o.METHOD_ID = pm.METHOD_ID
            ORDER BY o.ORDER_DATE DESC LIMIT 5
        `;

    db.query(latestSql, (err, latest) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({
        success: true,
        stats: stats[0],
        transactions: latest,
      });
    });
  });
};

// 4. Create Order (Checkout)
export const createOrder = async (req, res) => {
  const { orderDate, custId, userId, methodId, total, items } = req.body;
  console.log("Request Order receive:", {
    orderDate,
    custId,
    userId,
    methodId,
    total,
    items,
  });

  // Pastikan custId valid di database (FK constraint)
  // Jika 'admin', fallback ke '-NoName-' karena 'admin' tidak ada di tabel customers
  let finalCustId = custId || "-NoName-";
  if (finalCustId === "admin") {
    finalCustId = "-NoName-";
  }

  // Format tanggal agar sesuai DATETIME MySQL (YYYY-MM-DD HH:MM:SS)
  // Jika hanya YYYY-MM-DD, tambahkan jam default
  const formattedDate = orderDate.includes(" ")
    ? orderDate
    : `${orderDate} ${new Date().toTimeString().split(" ")[0]}`;

  // Use a transaction
  db.getConnection((err, connection) => {
    if (err) {
      console.error("Database connection error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Gagal mendapatkan koneksi" });
    }

    connection.beginTransaction((err) => {
      if (err) {
        console.error("Transaction error:", err);
        connection.release();
        return res
          .status(500)
          .json({ success: false, message: "Gagal memulai transaksi" });
      }

      // 1. Insert into orders
      const orderSql = `INSERT INTO orders (ORDER_DATE, CUST_ID, USER_ID, TOTAL, METHOD_ID) VALUES (?, ?, ?, ?, ?)`;
      const orderValues = [
        formattedDate,
        finalCustId,
        userId || "12345678",
        total,
        methodId || "1",
      ];

      connection.query(orderSql, orderValues, (err, result) => {
        if (err) {
          console.error("Order master insert error:", err);
          return connection.rollback(() => {
            connection.release();
            res.status(500).json({
              success: false,
              message: "Gagal menyimpan master order: " + err.message,
              error: err.message,
            });
          });
        }

        const orderId = result.insertId;

        // 2. Insert into order_details (Multiple items)
        const detailsSql = `INSERT INTO order_details (ORDER_ID, PRODUCT_ID, QTY, PRICE) VALUES ?`;
        const detailsValues = items.map((item) => [
          orderId,
          item.productId,
          item.qty,
          item.price,
        ]);

        connection.query(detailsSql, [detailsValues], (err) => {
          if (err) {
            console.error("Order details insert error:", err);
            return connection.rollback(() => {
              connection.release();
              res.status(500).json({
                success: false,
                message: "Gagal menyimpan detail order: " + err.message,
              });
            });
          }

          // 3. Update stock for each product
          let stockUpdates = items.map((item) => {
            return new Promise((resolve, reject) => {
              connection.query(
                "UPDATE products SET STOCK = STOCK - ? WHERE PRODUCT_ID = ?",
                [item.qty, item.productId],
                (err) => {
                  if (err) reject(err);
                  else resolve();
                },
              );
            });
          });

          Promise.all(stockUpdates)
            .then(() => {
              connection.commit((err) => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    res.status(500).json({
                      success: false,
                      message: "Gagal commit transaksi",
                    });
                  });
                }
                connection.release();
                res.json({
                  success: true,
                  message: "Order berhasil dibuat",
                  orderId,
                });
              });
            })
            .catch((err) => {
              console.error("Stock update error:", err);
              return connection.rollback(() => {
                connection.release();
                res.status(500).json({
                  success: false,
                  message: "Gagal update stok",
                  error: err.message,
                });
              });
            });
        });
      });
    });
  });
};

// 5. Dashboard Reports (10 Analysis Queries)
export const getDashboardReports = async (req, res) => {
  const reportConfigs = [
    {
      title:
        "1. Produk yang paling banyak dibeli beserta jumlahnya pada tahun sebelumnya",
      query: `SELECT p.PRODUCT_NAME, SUM(od.QTY) AS total_terjual 
              FROM products p 
              INNER JOIN order_details od ON p.PRODUCT_ID = od.PRODUCT_ID
              WHERE od.ORDER_ID IN (
                  SELECT ORDER_ID 
                  FROM orders 
                  WHERE YEAR(ORDER_DATE) = YEAR(CURDATE()) - 1
              )
              GROUP BY p.PRODUCT_ID, p.PRODUCT_NAME`,
    },
    {
      title:
        "2. Siapa saja yang paling banyak melakukan order beserta jumlahnya pada tahun sebelumnya",
      query: `SELECT c.CUST_NAME as pelanggan, COUNT(o.ORDER_ID) AS total_order
              FROM orders o
              LEFT JOIN customers c ON o.CUST_ID = c.CUST_ID
              WHERE YEAR(o.ORDER_DATE) = YEAR(CURDATE()) - 1
              GROUP BY o.CUST_ID, c.CUST_NAME`,
    },
    {
      title:
        "3. Siapa saja yang paling besar nilai ordenya beserta nominalnya pada tahun sebelumnya",
      query: `SELECT c.CUST_NAME as pelanggan, SUM(o.TOTAL) AS total_nominal
              FROM orders o
              LEFT JOIN customers c ON o.CUST_ID = c.CUST_ID
              WHERE YEAR(o.ORDER_DATE) = YEAR(CURDATE()) - 1
              GROUP BY o.CUST_ID, c.CUST_NAME`,
    },
    {
      title:
        "4. Siapa saja yang jumlah item produk ordernya paling banyak beserta jumlahnya pada tahun sebelumnya",
      query: `SELECT c.CUST_NAME as pelanggan, SUM(od.QTY) AS total_item
              FROM orders o
              LEFT JOIN customers c ON o.CUST_ID = c.CUST_ID
              INNER JOIN order_details od ON o.ORDER_ID = od.ORDER_ID
              WHERE o.ORDER_ID IN (
                  SELECT ORDER_ID 
                  FROM orders 
                  WHERE YEAR(ORDER_DATE) = YEAR(CURDATE()) - 1
              )
              GROUP BY o.CUST_ID, c.CUST_NAME`,
    },
    {
      title: "5. 10 produk terlaris beserta jumlahnya pada tahun sebelumnya",
      query: `SELECT p.PRODUCT_NAME, SUM(od.QTY) AS total_terjual 
              FROM products p 
              INNER JOIN order_details od ON p.PRODUCT_ID = od.PRODUCT_ID
              WHERE od.ORDER_ID IN (
                  SELECT ORDER_ID 
                  FROM orders 
                  WHERE YEAR(ORDER_DATE) = YEAR(CURDATE()) - 1
              )
              GROUP BY p.PRODUCT_ID, p.PRODUCT_NAME
              ORDER BY total_terjual DESC
              LIMIT 10`,
    },
    {
      title:
        "6. tampilan profit penjualan bulanan di tahun sebelumnya untuk setiap produk",
      query: `SELECT p.PRODUCT_NAME, MONTH(o.ORDER_DATE) AS bulan, SUM(od.PRICE * od.QTY) AS total_profit
              FROM products p 
              INNER JOIN order_details od ON p.PRODUCT_ID = od.PRODUCT_ID
              INNER JOIN orders o ON od.ORDER_ID = o.ORDER_ID
              WHERE YEAR(o.ORDER_DATE) = YEAR(CURDATE()) - 1
              GROUP BY p.PRODUCT_ID, p.PRODUCT_NAME, bulan`,
    },
    {
      title:
        "7. tampilan jumlah penjualan bulanan di tahun sebelumnya untuk setiap produk",
      query: `SELECT p.PRODUCT_NAME, MONTH(o.ORDER_DATE) AS bulan, SUM(od.QTY) AS jumlah_terjual
              FROM products p 
              INNER JOIN order_details od ON p.PRODUCT_ID = od.PRODUCT_ID
              INNER JOIN orders o ON od.ORDER_ID = o.ORDER_ID
              WHERE YEAR(o.ORDER_DATE) = YEAR(CURDATE()) - 1
              GROUP BY p.PRODUCT_ID, p.PRODUCT_NAME, bulan`,
    },
    {
      title:
        "8. tampilan jumlah order bulanan di tahun sebelumnya untuk setiap customer",
      query: `SELECT c.CUST_NAME as pelanggan, MONTH(o.ORDER_DATE) AS bulan, COUNT(o.ORDER_ID) AS jumlah_order
              FROM orders o
              LEFT JOIN customers c ON o.CUST_ID = c.CUST_ID
              WHERE YEAR(o.ORDER_DATE) = YEAR(CURDATE()) - 1
              GROUP BY o.CUST_ID, c.CUST_NAME, bulan`,
    },
    {
      title:
        "9. tampilan total nominal order bulanan di tahun sebelumnya untuk setiap customer",
      query: `SELECT c.CUST_NAME as pelanggan, MONTH(o.ORDER_DATE) AS bulan, SUM(o.TOTAL) AS total_nominal
              FROM orders o
              LEFT JOIN customers c ON o.CUST_ID = c.CUST_ID
              WHERE YEAR(o.ORDER_DATE) = YEAR(CURDATE()) - 1
              GROUP BY o.CUST_ID, c.CUST_NAME, bulan`,
    },
    {
      title:
        "10. tampilan jumlah layanan bulanan di tahun sebelumnya untuk setiap kasir",
      query: `SELECT k.USERNAME AS kasir, MONTH(o.ORDER_DATE) AS bulan, COUNT(o.ORDER_ID) AS jumlah_layanan
              FROM cashiers k
              INNER JOIN orders o ON k.USER_ID = o.USER_ID
              WHERE YEAR(o.ORDER_DATE) = YEAR(CURDATE()) - 1
              GROUP BY k.USER_ID, k.USERNAME, bulan`,
    },
  ];

  try {
    const results = [];
    for (const config of reportConfigs) {
      const rows = await new Promise((resolve, reject) => {
        db.query(config.query, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
      results.push({ title: config.title, data: rows });
    }
    res.json({ success: true, data: results });
  } catch (err) {
    console.error("Dashboard Reports Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
