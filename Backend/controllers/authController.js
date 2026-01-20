import db from "../config/db.js";

export const login = (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return res
      .status(400)
      .json({ success: false, message: "ID dan Password wajib diisi!" });
  }

  // Cek jika login sebagai admin dengan kredensial statis
  if (
    (id === "admin" && password === "admin") ||
    (id.toLowerCase() === "admin" && password === "admin")
  ) {
    return res.json({
      success: true,
      message: "Login Admin Berhasil!",
      user: {
        id: "admin",
        name: "Administrator TUKO",
        email: "admin@tukopi.com",
        role: "admin",
      },
    });
  }

  // Cari pelanggan berdasarkan CUST_ID (NIM)
  const sql = "SELECT * FROM customers WHERE CUST_ID = ?";
  db.query(sql, [id], (err, results) => {
    if (err)
      return res.status(500).json({ success: false, message: err.message });

    if (results.length === 0) {
      // Jika tidak ada di customers, coba cari di cashiers (mungkin ini admin/kasir)
      const sqlCashier =
        "SELECT * FROM cashiers WHERE USER_ID = ? OR USERNAME = ?";
      return db.query(sqlCashier, [id, id], (errCase, resultsCase) => {
        if (errCase)
          return res
            .status(500)
            .json({ success: false, message: errCase.message });

        if (resultsCase.length === 0) {
          return res.status(404).json({
            success: false,
            message: "ID Mahasiswa atau Username tidak ditemukan!",
          });
        }

        const cashier = resultsCase[0];
        if (password === cashier.PASSWORD) {
          return res.json({
            success: true,
            message: "Login Berhasil sebagai Staff!",
            user: {
              id: cashier.USER_ID,
              name: cashier.USERNAME,
              email: cashier.EMAIL,
              role: "admin", // Default role admin untuk yang ada di tabel cashiers
            },
          });
        } else {
          return res
            .status(401)
            .json({ success: false, message: "Password salah!" });
        }
      });
    }

    const user = results[0];

    // Validasi: Apakah password yang dimasukkan sama dengan NIM?
    // Cek password dari kolom PASSWORD (jika ada) atau fallback ke CUST_ID
    const dbPassword = user.PASSWORD || user.CUST_ID;

    if (password === dbPassword) {
      // Tentukan role berdasarkan NIM spesifik
      const role = user.CUST_ID === "24090022" ? "admin" : "customer";

      res.json({
        success: true,
        message: "Login Berhasil!",
        user: {
          id: user.CUST_ID,
          name: user.CUST_NAME,
          email: user.EMAIL,
          role: role, // Tambahkan role dalam response
        },
      });
    } else {
      res.status(401).json({ success: false, message: "Password salah!" });
    }
  });
};

export const register = (req, res) => {
  const { id, name, email, password } = req.body;

  if (!id || !name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Semua field wajib diisi!" });
  }

  // Cek apakah ID sudah ada
  const checkSql = "SELECT * FROM customers WHERE CUST_ID = ?";
  db.query(checkSql, [id], (err, results) => {
    if (err)
      return res.status(500).json({ success: false, message: err.message });
    if (results.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "ID sudah terdaftar!" });
    }

    // Insert ke database
    // Kita berikan default value untuk field NOT NULL lainnya agar tidak error
    const insertSql = `
      INSERT INTO customers 
      (CUST_ID, CUST_NAME, EMAIL, PASSWORD, ADDRESS, PLACE_OF_BIRTH, CONTACT_NUMBER, GENDER_ID, CREATED_AT, CREATED_BY) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'SYSTEM')
    `;

    const values = [
      id,
      name,
      email,
      password,
      "-", // Address
      "-", // Place of Birth
      "-", // Contact Number
      "L", // Gender Default
    ];

    db.query(insertSql, values, (err) => {
      if (err) {
        // Jika error karena kolom PASSWORD belum ada, kita coba insert tanpa PASSWORD (fallback)
        if (err.code === "ER_BAD_FIELD_ERROR") {
          const fallbackSql = `
            INSERT INTO customers 
            (CUST_ID, CUST_NAME, EMAIL, ADDRESS, PLACE_OF_BIRTH, CONTACT_NUMBER, GENDER_ID, CREATED_AT, CREATED_BY) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 'SYSTEM')
          `;
          return db.query(
            fallbackSql,
            [id, name, email, "-", "-", "-", "L"],
            (err2) => {
              if (err2)
                return res
                  .status(500)
                  .json({ success: false, message: err2.message });
              res.json({
                success: true,
                message: "Registrasi Berhasil! (Password disamakan dengan ID)",
              });
            },
          );
        }
        return res.status(500).json({ success: false, message: err.message });
      }
      res.json({ success: true, message: "Registrasi Berhasil!" });
    });
  });
};
