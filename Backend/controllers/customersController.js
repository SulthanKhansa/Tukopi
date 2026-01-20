import db from "../config/db.js";

// 1. GET ALL
export const getCustomers = (req, res) => {
  const sql = "SELECT * FROM customers";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Data Pelanggan", data: results });
  });
};

// 2. GET BY ID
export const getCustomerById = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM customers WHERE CUST_ID = ?";
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Pelanggan tidak ditemukan" });
    res.json({ message: "Detail Pelanggan", data: results[0] });
  });
};

// 3. CREATE (Dengan ID Manual)
export const createCustomer = (req, res) => {
  const {
    cust_id,
    cust_name,
    address,
    place_of_birth,
    date_of_birth,
    contact_number,
    email,
    gender_id,
  } = req.body;

  if (!cust_id) {
    return res.status(400).json({ message: "ID wajib diisi!" });
  }

  // Handle empty date
  const finalDob = date_of_birth === "" ? null : date_of_birth;

  const sql = `INSERT INTO customers 
                 (CUST_ID, CUST_NAME, ADDRESS, PLACE_OF_BIRTH, DATE_OF_BIRTH, CONTACT_NUMBER, EMAIL, GENDER_ID, CREATED_AT, UPDATED_AT, CREATED_BY, UPDATED_BY) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), 'ADMIN', 'ADMIN')`;

  db.query(
    sql,
    [
      cust_id,
      cust_name,
      address,
      place_of_birth,
      finalDob,
      contact_number,
      email,
      gender_id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error creating customer:", err);
        if (err.code === "ER_DUP_ENTRY") {
          return res
            .status(400)
            .json({ message: "ID Pelanggan sudah terdaftar!" });
        }
        return res.status(500).json({ message: err.message });
      }
      res.status(201).json({
        message: "Berhasil Menambah Pelanggan!",
        data: req.body,
      });
    },
  );
};

// 4. UPDATE
export const updateCustomer = (req, res) => {
  const { id } = req.params;
  const {
    cust_name,
    address,
    place_of_birth,
    date_of_birth,
    contact_number,
    email,
    gender_id,
  } = req.body;

  const finalDob = date_of_birth === "" ? null : date_of_birth;

  const sql = `UPDATE customers SET 
                 CUST_NAME = ?, ADDRESS = ?, PLACE_OF_BIRTH = ?, DATE_OF_BIRTH = ?, CONTACT_NUMBER = ?, EMAIL = ?, GENDER_ID = ?, UPDATED_AT = NOW(), UPDATED_BY = 'ADMIN' 
                 WHERE CUST_ID = ?`;

  db.query(
    sql,
    [
      cust_name,
      address,
      place_of_birth,
      finalDob,
      contact_number,
      email,
      gender_id,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating customer:", err);
        return res.status(500).json({ message: err.message });
      }
      if (result.affectedRows === 0)
        return res
          .status(404)
          .json({ message: "Gagal update, ID tidak ditemukan" });

      res.json({ message: "Berhasil Update Pelanggan!" });
    },
  );
};
// 6. GET CUSTOMER ORDERS (Riwayat Transaksi)
export const getCustomerOrders = (req, res) => {
  const { id } = req.params;
  const sql = `
        SELECT 
            o.ORDER_ID, 
            o.ORDER_DATE, 
            o.TOTAL, 
            m.METHOD as METODE_PEMBAYARAN
        FROM orders o
        LEFT JOIN payment_methods m ON o.METHOD_ID = m.METHOD_ID
        WHERE o.CUST_ID = ?
        ORDER BY o.ORDER_DATE DESC
    `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Histori Transaksi", data: results });
  });
};
// 5. DELETE
export const deleteCustomer = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM customers WHERE CUST_ID = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ message: "Gagal hapus, ID tidak ditemukan" });

    res.json({ message: "Berhasil Menghapus Pelanggan!" });
  });
};
