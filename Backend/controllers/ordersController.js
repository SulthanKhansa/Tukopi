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
      title: "1. Produk Terlaris Tahun Sebelumnya",
      query: `SELECT * FROM (
          SELECT 
            (SELECT product_name FROM products WHERE product_id = od.product_id) AS nama_produk, 
            SUM(QTY) AS jumlah
          FROM order_details od
          WHERE (SELECT YEAR(order_date) FROM orders WHERE order_id = od.order_id) = YEAR(CURDATE()) - 1
          GROUP BY od.product_id
        ) AS rekap
        WHERE jumlah = (
          SELECT MAX(total_qty) 
          FROM (
            SELECT SUM(QTY) AS total_qty 
            FROM order_details od2
            WHERE (SELECT YEAR(order_date) FROM orders WHERE order_id = od2.order_id) = YEAR(CURDATE()) - 1
            GROUP BY od2.product_id
          ) AS tabel_bantu
        )`,
    },
    {
      title: "2. Customer paling banyak order",
      query: `SELECT c.cust_name, COUNT(o.order_id) AS total_order
              FROM customers c
              NATURAL JOIN orders o
              WHERE YEAR(o.order_date) = YEAR(CURDATE()) - 1
              GROUP BY c.cust_id, c.cust_name
              HAVING COUNT(o.order_id) = (
                SELECT MAX(jumlah_order)
                FROM (
                  SELECT COUNT(order_id) AS jumlah_order
                  FROM orders
                  WHERE YEAR(order_date) = YEAR(CURDATE()) - 1
                  GROUP BY cust_id
                ) t
              )`,
    },
    {
      title: "3. Customer nilai order terbesar",
      query: `SELECT c.cust_name, SUM(od.qty * od.price) AS total_nilai_order
              FROM customers c
              NATURAL JOIN orders o
              NATURAL JOIN order_details od
              WHERE YEAR(o.order_date) = YEAR(CURDATE()) - 1
              GROUP BY c.cust_id, c.cust_name
              HAVING SUM(od.qty * od.price) = (
                SELECT MAX(total_nilai)
                FROM (
                  SELECT SUM(od2.qty * od2.price) AS total_nilai
                  FROM orders o2
                  NATURAL JOIN order_details od2
                  WHERE YEAR(o2.order_date) = YEAR(CURDATE()) - 1
                  GROUP BY o2.cust_id
                ) t
              )`,
    },
    {
      title: "4. Customer jumlah item terbanyak",
      query: `SELECT c.cust_name, SUM(od.qty) AS total_item
              FROM customers c
              NATURAL JOIN orders o
              NATURAL JOIN order_details od
              WHERE YEAR(o.order_date) = YEAR(CURDATE()) - 1
              GROUP BY c.cust_id, c.cust_name
              HAVING SUM(od.qty) = (
                SELECT MAX(jumlah_item)
                FROM (
                  SELECT SUM(od2.qty) AS jumlah_item
                  FROM orders o2
                  NATURAL JOIN order_details od2
                  WHERE YEAR(o2.order_date) = YEAR(CURDATE()) - 1
                  GROUP BY o2.cust_id
                ) t
              )`,
    },
    {
      title: "5. 10 produk terlaris",
      query: `SELECT p.product_name, SUM(od.qty) AS total_terjual
              FROM products p
              NATURAL JOIN order_details od
              NATURAL JOIN orders o
              WHERE YEAR(o.order_date) = YEAR(CURDATE()) - 1
              GROUP BY p.product_id, p.product_name
              ORDER BY total_terjual DESC
              LIMIT 10`,
    },
    {
      title: "6. Profit bulanan per produk",
      query: `SELECT p.product_name,
                SUM(CASE WHEN MONTH(o.order_date)=1 THEN od.qty*od.price ELSE 0 END) AS Januari,
                SUM(CASE WHEN MONTH(o.order_date)=2 THEN od.qty*od.price ELSE 0 END) AS Februari,
                SUM(CASE WHEN MONTH(o.order_date)=3 THEN od.qty*od.price ELSE 0 END) AS Maret,
                SUM(CASE WHEN MONTH(o.order_date)=4 THEN od.qty*od.price ELSE 0 END) AS April,
                SUM(CASE WHEN MONTH(o.order_date)=5 THEN od.qty*od.price ELSE 0 END) AS Mei,
                SUM(CASE WHEN MONTH(o.order_date)=6 THEN od.qty*od.price ELSE 0 END) AS Juni,
                SUM(CASE WHEN MONTH(o.order_date)=7 THEN od.qty*od.price ELSE 0 END) AS Juli,
                SUM(CASE WHEN MONTH(o.order_date)=8 THEN od.qty*od.price ELSE 0 END) AS Agustus,
                SUM(CASE WHEN MONTH(o.order_date)=9 THEN od.qty*od.price ELSE 0 END) AS September,
                SUM(CASE WHEN MONTH(o.order_date)=10 THEN od.qty*od.price ELSE 0 END) AS Oktober,
                SUM(CASE WHEN MONTH(o.order_date)=11 THEN od.qty*od.price ELSE 0 END) AS November,
                SUM(CASE WHEN MONTH(o.order_date)=12 THEN od.qty*od.price ELSE 0 END) AS Desember
              FROM products p
              NATURAL JOIN order_details od
              NATURAL JOIN orders o
              WHERE YEAR(o.order_date)=YEAR(CURDATE())-1
              GROUP BY p.product_id, p.product_name`,
    },
    {
      title: "7. Jumlah penjualan bulanan per produk",
      query: `SELECT p.product_name,
                SUM(CASE WHEN MONTH(o.order_date)=1 THEN od.qty ELSE 0 END) AS Januari,
                SUM(CASE WHEN MONTH(o.order_date)=2 THEN od.qty ELSE 0 END) AS Februari,
                SUM(CASE WHEN MONTH(o.order_date)=3 THEN od.qty ELSE 0 END) AS Maret,
                SUM(CASE WHEN MONTH(o.order_date)=4 THEN od.qty ELSE 0 END) AS April,
                SUM(CASE WHEN MONTH(o.order_date)=5 THEN od.qty ELSE 0 END) AS Mei,
                SUM(CASE WHEN MONTH(o.order_date)=6 THEN od.qty ELSE 0 END) AS Juni,
                SUM(CASE WHEN MONTH(o.order_date)=7 THEN od.qty ELSE 0 END) AS Juli,
                SUM(CASE WHEN MONTH(o.order_date)=8 THEN od.qty ELSE 0 END) AS Agustus,
                SUM(CASE WHEN MONTH(o.order_date)=9 THEN od.qty ELSE 0 END) AS September,
                SUM(CASE WHEN MONTH(o.order_date)=10 THEN od.qty ELSE 0 END) AS Oktober,
                SUM(CASE WHEN MONTH(o.order_date)=11 THEN od.qty ELSE 0 END) AS November,
                SUM(CASE WHEN MONTH(o.order_date)=12 THEN od.qty ELSE 0 END) AS Desember
              FROM products p
              NATURAL JOIN order_details od
              NATURAL JOIN orders o
              WHERE YEAR(o.order_date)=YEAR(CURDATE())-1
              GROUP BY p.product_id, p.product_name`,
    },
    {
      title: "8. Order bulanan per customer",
      query: `SELECT c.cust_name,
                SUM(CASE WHEN MONTH(o.order_date)=1 THEN 1 ELSE 0 END) AS Januari,
                SUM(CASE WHEN MONTH(o.order_date)=2 THEN 1 ELSE 0 END) AS Februari,
                SUM(CASE WHEN MONTH(o.order_date)=3 THEN 1 ELSE 0 END) AS Maret,
                SUM(CASE WHEN MONTH(o.order_date)=4 THEN 1 ELSE 0 END) AS April,
                SUM(CASE WHEN MONTH(o.order_date)=5 THEN 1 ELSE 0 END) AS Mei,
                SUM(CASE WHEN MONTH(o.order_date)=6 THEN 1 ELSE 0 END) AS Juni,
                SUM(CASE WHEN MONTH(o.order_date)=7 THEN 1 ELSE 0 END) AS Juli,
                SUM(CASE WHEN MONTH(o.order_date)=8 THEN 1 ELSE 0 END) AS Agustus,
                SUM(CASE WHEN MONTH(o.order_date)=9 THEN 1 ELSE 0 END) AS September,
                SUM(CASE WHEN MONTH(o.order_date)=10 THEN 1 ELSE 0 END) AS Oktober,
                SUM(CASE WHEN MONTH(o.order_date)=11 THEN 1 ELSE 0 END) AS November,
                SUM(CASE WHEN MONTH(o.order_date)=12 THEN 1 ELSE 0 END) AS Desember
              FROM customers c
              LEFT JOIN orders o ON c.cust_id=o.cust_id
              AND YEAR(o.order_date)=YEAR(CURDATE())-1
              GROUP BY c.cust_id, c.cust_name`,
    },
    {
      title: "9. Nominal order bulanan per customer",
      query: `SELECT c.cust_name,
                SUM(CASE WHEN MONTH(o.order_date)=1 THEN od.qty*od.price ELSE 0 END) AS Januari,
                SUM(CASE WHEN MONTH(o.order_date)=2 THEN od.qty*od.price ELSE 0 END) AS Februari,
                SUM(CASE WHEN MONTH(o.order_date)=3 THEN od.qty*od.price ELSE 0 END) AS Maret,
                SUM(CASE WHEN MONTH(o.order_date)=4 THEN od.qty*od.price ELSE 0 END) AS April,
                SUM(CASE WHEN MONTH(o.order_date)=5 THEN od.qty*od.price ELSE 0 END) AS Mei,
                SUM(CASE WHEN MONTH(o.order_date)=6 THEN od.qty*od.price ELSE 0 END) AS Juni,
                SUM(CASE WHEN MONTH(o.order_date)=7 THEN od.qty*od.price ELSE 0 END) AS Juli,
                SUM(CASE WHEN MONTH(o.order_date)=8 THEN od.qty*od.price ELSE 0 END) AS Agustus,
                SUM(CASE WHEN MONTH(o.order_date)=9 THEN od.qty*od.price ELSE 0 END) AS September,
                SUM(CASE WHEN MONTH(o.order_date)=10 THEN od.qty*od.price ELSE 0 END) AS Oktober,
                SUM(CASE WHEN MONTH(o.order_date)=11 THEN od.qty*od.price ELSE 0 END) AS November,
                SUM(CASE WHEN MONTH(o.order_date)=12 THEN od.qty*od.price ELSE 0 END) AS Desember
              FROM customers c
              NATURAL JOIN orders o
              NATURAL JOIN order_details od
              WHERE YEAR(o.order_date)=YEAR(CURDATE())-1
              GROUP BY c.cust_id, c.cust_name`,
    },
    {
      title: "10. Layanan bulanan per kasir",
      query: `SELECT c.EMAIL,
                SUM(CASE WHEN MONTH(o.order_date)=1 THEN 1 ELSE 0 END) AS Januari,
                SUM(CASE WHEN MONTH(o.order_date)=2 THEN 1 ELSE 0 END) AS Februari,
                SUM(CASE WHEN MONTH(o.order_date)=3 THEN 1 ELSE 0 END) AS Maret,
                SUM(CASE WHEN MONTH(o.order_date)=4 THEN 1 ELSE 0 END) AS April,
                SUM(CASE WHEN MONTH(o.order_date)=5 THEN 1 ELSE 0 END) AS Mei,
                SUM(CASE WHEN MONTH(o.order_date)=6 THEN 1 ELSE 0 END) AS Juni,
                SUM(CASE WHEN MONTH(o.order_date)=7 THEN 1 ELSE 0 END) AS Juli,
                SUM(CASE WHEN MONTH(o.order_date)=8 THEN 1 ELSE 0 END) AS Agustus,
                SUM(CASE WHEN MONTH(o.order_date)=9 THEN 1 ELSE 0 END) AS September,
                SUM(CASE WHEN MONTH(o.order_date)=10 THEN 1 ELSE 0 END) AS Oktober,
                SUM(CASE WHEN MONTH(o.order_date)=11 THEN 1 ELSE 0 END) AS November,
                SUM(CASE WHEN MONTH(o.order_date)=12 THEN 1 ELSE 0 END) AS Desember
              FROM cashiers c
              NATURAL JOIN orders o
              WHERE YEAR(o.order_date)=YEAR(CURDATE())-1
              GROUP BY c.USER_ID, c.EMAIL`,
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
