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
      const orderSql = `INSERT INTO orders (ORDER_DATE, CUST_ID, USER_ID, TOTAL, METHOD_ID) 
                        VALUES (?, ?, COALESCE(?, (SELECT USER_ID FROM cashiers ORDER BY RAND() LIMIT 1)), ?, ?)`;
      const orderValues = [
        formattedDate,
        finalCustId,
        userId || null,
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
      query: `SELECT p.PRODUCT_ID, p.PRODUCT_NAME, penjualan_produk.total_terjual
              FROM products p
              JOIN (
                  SELECT od.PRODUCT_ID, SUM(od.QTY) AS total_terjual
                  FROM order_details od
                  JOIN orders o ON od.ORDER_ID = o.ORDER_ID
                  WHERE YEAR(o.ORDER_DATE) = YEAR(CURDATE()) - 1
                  GROUP BY od.PRODUCT_ID
              ) AS penjualan_produk ON p.PRODUCT_ID = penjualan_produk.PRODUCT_ID
              ORDER BY penjualan_produk.total_terjual DESC`,
    },
    {
      title:
        "2. Siapa saja yang paling banyak melakukan order beserta jumlahnya pada tahun sebelumnya",
      query: `SELECT c.CUST_ID, c.CUST_NAME, total_transaksi.jumlah_order
              FROM customers c
              JOIN (
                  SELECT CUST_ID, COUNT(ORDER_ID) AS jumlah_order
                  FROM orders
                  WHERE YEAR(ORDER_DATE) = YEAR(CURDATE()) - 1
                  GROUP BY CUST_ID
              ) AS total_transaksi ON c.CUST_ID = total_transaksi.CUST_ID
              ORDER BY total_transaksi.jumlah_order DESC`,
    },
    {
      title:
        "3. Siapa saja yang paling besar nilai ordenya beserta nominalnya pada tahun sebelumnya",
      query: `SELECT c.CUST_ID, c.CUST_NAME, nominal_order.total_nominal
              FROM customers c
              JOIN (
                  SELECT CUST_ID, SUM(TOTAL) AS total_nominal
                  FROM orders
                  WHERE YEAR(ORDER_DATE) = YEAR(CURDATE()) - 1
                  GROUP BY CUST_ID
              ) AS nominal_order ON c.CUST_ID = nominal_order.CUST_ID
              ORDER BY nominal_order.total_nominal DESC`,
    },
    {
      title:
        "4. Siapa saja yang jumlah item produk ordernya paling banyak beserta jumlahnya pada tahun sebelumnya",
      query: `SELECT c.CUST_ID, c.CUST_NAME, belanja_item.total_qty
              FROM customers c
              JOIN (
                  SELECT o.CUST_ID, SUM(od.QTY) AS total_qty
                  FROM orders o
                  JOIN order_details od ON o.ORDER_ID = od.ORDER_ID
                  WHERE YEAR(o.ORDER_DATE) = YEAR(CURDATE()) - 1
                  GROUP BY o.CUST_ID
              ) AS belanja_item ON c.CUST_ID = belanja_item.CUST_ID
              ORDER BY belanja_item.total_qty DESC`,
    },
    {
      title: "5. 10 produk terlaris beserta jumlahnya pada tahun sebelumnya",
      query: `SELECT p.PRODUCT_ID, p.PRODUCT_NAME, penjualan_produk.total_terjual
              FROM products p
              JOIN (
                  SELECT od.PRODUCT_ID, SUM(od.QTY) AS total_terjual
                  FROM order_details od
                  JOIN orders o ON od.ORDER_ID = o.ORDER_ID
                  WHERE YEAR(o.ORDER_DATE) = YEAR(CURDATE()) - 1
                  GROUP BY od.PRODUCT_ID
              ) AS penjualan_produk ON p.PRODUCT_ID = penjualan_produk.PRODUCT_ID
              ORDER BY penjualan_produk.total_terjual DESC
              LIMIT 10`,
    },
    {
      title:
        "6. tampilan profit penjualan bulanan di tahun sebelumnya untuk setiap produk",
      query: `SELECT 
                laporan_profit.bulan,
                p.PRODUCT_NAME,
                laporan_profit.total_profit
              FROM products p
              JOIN (
                  SELECT 
                      MONTH(o.ORDER_DATE) AS bulan,
                      od.PRODUCT_ID,
                      SUM((od.PRICE * od.QTY)) AS total_profit
                  FROM order_details od
                  JOIN orders o ON od.ORDER_ID = o.ORDER_ID
                  JOIN products p2 ON od.PRODUCT_ID = p2.PRODUCT_ID
                  WHERE YEAR(o.ORDER_DATE) = YEAR(CURDATE()) - 1
                  GROUP BY bulan, od.PRODUCT_ID
              ) AS laporan_profit ON p.PRODUCT_ID = laporan_profit.PRODUCT_ID
              ORDER BY laporan_profit.bulan ASC, laporan_profit.total_profit DESC`,
    },
    {
      title:
        "7. tampilan jumlah penjualan bulanan di tahun sebelumnya untuk setiap produk",
      query: `SELECT 
                p.PRODUCT_ID, 
                p.PRODUCT_NAME, 
                penjualan_bulanan.bulan, 
                penjualan_bulanan.total_qty
              FROM products p
              JOIN (
                  SELECT 
                      od.PRODUCT_ID, 
                      MONTH(o.ORDER_DATE) AS bulan, 
                      SUM(od.QTY) AS total_qty
                  FROM order_details od
                  JOIN orders o ON od.ORDER_ID = o.ORDER_ID
                  WHERE YEAR(o.ORDER_DATE) = YEAR(CURDATE()) - 1
                  GROUP BY od.PRODUCT_ID, bulan
              ) AS penjualan_bulanan ON p.PRODUCT_ID = penjualan_bulanan.PRODUCT_ID
              ORDER BY penjualan_bulanan.bulan ASC, penjualan_bulanan.total_qty DESC`,
    },
    {
      title:
        "8. tampilan jumlah order bulanan di tahun sebelumnya untuk setiap customer",
      query: `SELECT 
                c.CUST_ID, 
                c.CUST_NAME, 
                order_bulanan.bulan, 
                order_bulanan.jumlah_transaksi
              FROM customers c
              JOIN (
                  SELECT 
                      CUST_ID, 
                      MONTH(ORDER_DATE) AS bulan, 
                      COUNT(ORDER_ID) AS jumlah_transaksi
                  FROM orders
                  WHERE YEAR(ORDER_DATE) = YEAR(CURDATE()) - 1
                  GROUP BY CUST_ID, bulan
              ) AS order_bulanan ON c.CUST_ID = order_bulanan.CUST_ID
              ORDER BY order_bulanan.bulan ASC, order_bulanan.jumlah_transaksi DESC`,
    },
    {
      title:
        "9. tampilan total nominal order bulanan di tahun sebelumnya untuk setiap customer",
      query: `SELECT 
                c.CUST_ID, 
                c.CUST_NAME, 
                nominal_bulanan.bulan, 
                nominal_bulanan.total_pembayaran
              FROM customers c
              JOIN (
                  SELECT 
                      CUST_ID, 
                      MONTH(ORDER_DATE) AS bulan, 
                      SUM(TOTAL) AS total_pembayaran
                  FROM orders
                  WHERE YEAR(ORDER_DATE) = YEAR(CURDATE()) - 1
                  GROUP BY CUST_ID, bulan
              ) AS nominal_bulanan ON c.CUST_ID = nominal_bulanan.CUST_ID
              ORDER BY nominal_bulanan.bulan ASC, nominal_bulanan.total_pembayaran DESC`,
    },
    {
      title:
        "10. tampilan jumlah layanan bulanan di tahun sebelumnya untuk setiap kasir",
      query: `SELECT 
                cs.USER_ID, 
                cs.USERNAME AS nama_kasir, 
                layanan_bulanan.bulan, 
                layanan_bulanan.total_layanan
              FROM cashiers cs
              JOIN (
                  SELECT 
                      USER_ID, 
                      MONTH(ORDER_DATE) AS bulan, 
                      COUNT(ORDER_ID) AS total_layanan
                  FROM orders
                  WHERE YEAR(ORDER_DATE) = YEAR(CURDATE()) - 1
                  GROUP BY USER_ID, bulan
              ) AS layanan_bulanan ON cs.USER_ID = layanan_bulanan.USER_ID
              ORDER BY layanan_bulanan.bulan ASC, layanan_bulanan.total_layanan DESC`,
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
