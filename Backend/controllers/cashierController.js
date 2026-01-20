import db from "../config/db.js";

// 1. GET ALL
export const getCashiers = (req, res) => {
  const sql = "SELECT * FROM cashiers";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Data Kasir", data: results });
  });
};

// 2. GET BY ID
export const getCashierById = (req, res) => {
  const { id } = req.params;
  const sql = "SELECT * FROM cashiers WHERE USER_ID = ?";
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Cashier tidak ditemukan" });
    res.json({ message: "Detail Kasir", data: results[0] });
  });
};

// 3. CREATE
export const createCashier = (req, res) => {
  const {
    user_id,
    username,
    email,
    password,
    contact_number,
    gender_id,
    place_of_birth,
    date_of_birth,
    address,
  } = req.body;

  if (!user_id || !username) {
    return res.status(400).json({ message: "ID dan Username wajib diisi!" });
  }

  const finalPassword = password || "123456";
  const finalDob =
    date_of_birth === "" || date_of_birth === null ? null : date_of_birth;

  const sql = `INSERT INTO cashiers 
    (USER_ID, USERNAME, EMAIL, PASSWORD, CONTACT_NUMBER, GENDER_ID, PLACE_OF_BIRTH, DATE_OF_BIRTH, ADDRESS, CREATED_AT, UPDATED_AT) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;

  db.query(
    sql,
    [
      user_id,
      username,
      email,
      finalPassword,
      contact_number,
      gender_id,
      place_of_birth,
      finalDob,
      address,
    ],
    (err, result) => {
      if (err) {
        console.error("Error creating cashier:", err);
        if (err.code === "ER_DUP_ENTRY") {
          return res
            .status(400)
            .json({ message: "ID tersebut sudah terdaftar!" });
        }
        return res.status(500).json({ message: err.message });
      }
      res
        .status(201)
        .json({ message: "Berhasil Menambah Kasir!", userId: user_id });
    },
  );
};

// 4. UPDATE
export const updateCashier = (req, res) => {
  const { id } = req.params;
  const {
    username,
    email,
    contact_number,
    address,
    place_of_birth,
    date_of_birth,
    gender_id,
  } = req.body;

  const finalDob =
    date_of_birth === "" || date_of_birth === null ? null : date_of_birth;

  const sql = `UPDATE cashiers SET 
                 USERNAME=?, EMAIL=?, CONTACT_NUMBER=?, ADDRESS=?, 
                 PLACE_OF_BIRTH=?, DATE_OF_BIRTH=?, GENDER_ID=?, 
                 UPDATED_AT=NOW() 
                 WHERE USER_ID=?`;

  db.query(
    sql,
    [
      username,
      email,
      contact_number,
      address,
      place_of_birth,
      finalDob,
      gender_id,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Error updating cashier:", err);
        return res.status(500).json({ message: err.message });
      }
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Kasir tidak ditemukan" });
      res.json({ message: "Berhasil Update Kasir!" });
    },
  );
};

// 5. DELETE
export const deleteCashier = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM cashiers WHERE USER_ID = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Kasir tidak ditemukan" });
    res.json({ message: "Berhasil Menghapus Kasir!" });
  });
};
