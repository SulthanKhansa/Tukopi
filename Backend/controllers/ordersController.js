import db from "../config/db.js";

// 1. Ambil List Transaksi (Master)
export const getOrders = (req, res) => {
  // Menampilkan daftar transaksi global
  const sql = `
        SELECT 
            o.ORDER_ID as id, 
            o.ORDER_DATE as tanggal, 
            o.TOTAL as total, 
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

// 2. Ambil Detail Item per Transaksi (Detail)
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
