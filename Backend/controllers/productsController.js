import db from "../config/db.js";

// 1. GET ALL (Lihat Semua)
export const getProducts = (req, res) => {
  const sql = `
        SELECT p.*, pc.CATEGORY 
        FROM products p
        LEFT JOIN product_categories pc ON p.CATEGORY_ID = pc.CATEGORY_ID
    `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Data Produk", data: results });
  });
};

// 2. GET BY ID (Lihat Satu)
export const getProductById = (req, res) => {
  const { id } = req.params;
  const sql = `
        SELECT p.*, pc.CATEGORY 
        FROM products p
        LEFT JOIN product_categories pc ON p.CATEGORY_ID = pc.CATEGORY_ID
        WHERE p.PRODUCT_ID = ?
    `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    res.json({ message: "Detail Produk", data: results[0] });
  });
};

// 3. POST (Tambah Baru)
export const createProduct = (req, res) => {
  const { product_name, price, category_id, stock } = req.body;

  // Validasi sederhana
  if (!product_name || !price || !category_id) {
    return res
      .status(400)
      .json({ message: "Nama, Harga, dan Kategori wajib diisi!" });
  }

  // Handle number conversion
  const finalStock = stock === "" || stock === null ? 0 : parseInt(stock);
  const finalPrice = parseFloat(price);

  const sql = `INSERT INTO products 
                 (PRODUCT_NAME, PRICE, CATEGORY_ID, STOCK, CREATED_AT, UPDATED_AT, CREATED_BY, UPDATED_BY) 
                 VALUES (?, ?, ?, ?, NOW(), NOW(), 'ADMIN', 'ADMIN')`;

  db.query(
    sql,
    [product_name, finalPrice, category_id, finalStock],
    (err, result) => {
      if (err) {
        console.error("Error creating product:", err);
        return res.status(500).json({ message: err.message });
      }
      res.status(201).json({
        message: "Berhasil Menambah Produk!",
        productId: result.insertId,
        data: req.body,
      });
    },
  );
};

// 4. PUT (Edit/Update Data)
export const updateProduct = (req, res) => {
  const { id } = req.params; // Ambil ID dari URL
  const { product_name, price, category_id, stock } = req.body; // Ambil data baru dari Body

  // Validasi
  if (!product_name || !price || !category_id) {
    return res.status(400).json({ message: "Data tidak boleh kosong!" });
  }

  const finalStock = stock === "" || stock === null ? 0 : parseInt(stock);
  const finalPrice = parseFloat(price);

  const sql = `UPDATE products SET 
                 PRODUCT_NAME = ?, 
                 PRICE = ?, 
                 CATEGORY_ID = ?, 
                 STOCK = ?, 
                 UPDATED_AT = NOW(),
                 UPDATED_BY = 'ADMIN' 
                 WHERE PRODUCT_ID = ?`;

  db.query(
    sql,
    [product_name, finalPrice, category_id, finalStock, id],
    (err, result) => {
      if (err) {
        console.error("Error updating product:", err);
        return res.status(500).json({ message: err.message });
      }

      // Cek apakah ada data yang terhapus (artinya ID ditemukan)
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Produk tidak ditemukan, gagal update." });
      }

      res.json({ message: "Berhasil Update Produk!", data: req.body });
    },
  );
};

// 5. DELETE (Hapus Data)
export const deleteProduct = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM products WHERE PRODUCT_ID = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Produk tidak ditemukan, gagal hapus." });
    }

    res.json({ message: "Berhasil Menghapus Produk!" });
  });
};
