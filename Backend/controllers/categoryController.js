import db from "../config/db.js";

// 1. GET ALL
export const getCategories = (req, res) => {
  const sql = "SELECT * FROM product_categories";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Data Kategori Produk", data: results });
  });
};

// 2. GET BY ID
export const getCategoryById = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM product_categories WHERE CATEGORY_ID = ?";
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    res.json({ message: "Detail Kategori", data: results[0] });
  });
};

// 3. CREATE
export const createCategory = (req, res) => {
  const { id, name } = req.body;
  if (!id || !name) {
    return res
      .status(400)
      .json({ message: "ID dan Nama Kategori wajib diisi!" });
  }

  const sql =
    "INSERT INTO product_categories (CATEGORY_ID, CATEGORY) VALUES (?, ?)";
  db.query(sql, [id.toUpperCase(), name.toUpperCase()], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Kategori berhasil ditambahkan" });
  });
};

// 4. UPDATE
export const updateCategory = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Nama Kategori wajib diisi!" });
  }

  const sql =
    "UPDATE product_categories SET CATEGORY = ? WHERE CATEGORY_ID = ?";
  db.query(sql, [name.toUpperCase(), id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.affectedRows === 0)
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    res.json({ message: "Kategori berhasil diperbarui" });
  });
};

// 5. DELETE
export const deleteCategory = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM product_categories WHERE CATEGORY_ID = ?";
  db.query(sql, [id], (err, results) => {
    if (err) {
      if (err.code === "ER_ROW_IS_REFERENCED_2") {
        return res
          .status(400)
          .json({
            message:
              "Kategori tidak bisa dihapus karena masih digunakan oleh produk",
          });
      }
      return res.status(500).json({ message: err.message });
    }
    if (results.affectedRows === 0)
      return res.status(404).json({ message: "Kategori tidak ditemukan" });
    res.json({ message: "Kategori berhasil dihapus" });
  });
};
