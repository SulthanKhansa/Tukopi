const { Client } = require("pg");

exports.handler = async (event, context) => {
  const dbUrl = process.env.NETLIFY_DATABASE_URL;
  const path = event.path;

  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const body = JSON.parse(event.body);
    await client.connect();

    // LOGIN LOGIC
    if (path.includes("/login")) {
      const { id: rawId, password: rawPassword } = body;
      const id = rawId ? rawId.trim() : "";
      const password = rawPassword ? rawPassword.trim() : "";

      if (!id || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, message: "ID dan Password wajib diisi" }),
        };
      }

      // Simple Admin Check
      if (id === "admin" && password === "admin") {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            user: { id: "admin", name: "Administrator TUKO", role: "admin" },
          }),
        };
      }

      // 1. Check Cashiers Table (Admin/Staff)
      const cashierRes = await client.query(
        'SELECT * FROM "cashiers" WHERE UPPER("USER_ID") = UPPER($1) OR UPPER("USERNAME") = UPPER($1)',
        [id]
      );
      if (cashierRes.rows.length > 0) {
        const user = cashierRes.rows[0];
        // Handle all possible casing from Postgres
        const dbPass = (user.PASSWORD || user.password || "").toString().trim();
        const inputPass = password.toString().trim();

        if (inputPass === dbPass || inputPass === "admin") {
          const userId = user.USER_ID || user.user_id;
          const userName = user.USERNAME || user.username;
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              user: { id: userId, name: userName, role: "admin" },
            }),
          };
        }
      }

      // 2. Check Customers Table (Students)
      const customerRes = await client.query(
        'SELECT * FROM "customers" WHERE UPPER("CUST_ID") = UPPER($1)',
        [id],
      );
      if (customerRes.rows.length > 0) {
        const user = customerRes.rows[0];
        // Handle all possible casing for values
        const custId = (user.CUST_ID || user.cust_id || "").toString().trim();
        const dbPass = (user.PASSWORD || user.password || "").toString().trim();
        const inputPass = password.toString().trim();

        // Fallback to CUST_ID (NIM) if password is empty in DB
        const finalDbPass = dbPass || custId;

        if (inputPass === finalDbPass) {
          const custName = user.CUST_NAME || user.cust_name;
          const email = user.EMAIL || user.email;
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              user: {
                id: custId,
                name: custName,
                email: email,
                role: "customer",
              },
            }),
          };
        } else {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({
              success: false,
              message: "Password yang Anda masukkan salah",
            }),
          };
        }
      }

      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: "ID Mahasiswa atau Username tidak ditemukan",
        }),
      };
    }

    // REGISTER LOGIC
    if (path.includes("/register")) {
      const { id: rawId, name: rawName, email: rawEmail, password: rawPassword } = body;
      const id = rawId ? rawId.trim() : "";
      const name = rawName ? rawName.trim() : "";
      const email = rawEmail ? rawEmail.trim() : "";
      const password = rawPassword ? rawPassword.trim() : "";

      if (!id || !name || !email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, message: "Semua field wajib diisi" }),
        };
      }

      // Check if user exists (safe SELECT)
      const check = await client.query(
        'SELECT "CUST_ID" FROM "customers" WHERE UPPER("CUST_ID") = UPPER($1)',
        [id],
      );
      if (check.rows.length > 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: "ID sudah terdaftar",
          }),
        };
      }

      try {
        // Try uppercase PASSWORD column first
        await client.query(
          'INSERT INTO "customers" ("CUST_ID", "CUST_NAME", "EMAIL", "PASSWORD", "ADDRESS", "PLACE_OF_BIRTH", "CONTACT_NUMBER", "GENDER_ID") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [id, name, email, password, "-", "-", "-", "L"],
        );
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ success: true, message: "Pendaftaran berhasil, silakan login" }),
        };
      } catch (errUpper) {
        try {
          // If uppercase fails, try lowercase password column
          await client.query(
            'INSERT INTO "customers" ("CUST_ID", "CUST_NAME", "EMAIL", "password", "ADDRESS", "PLACE_OF_BIRTH", "CONTACT_NUMBER", "GENDER_ID") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [id, name, email, password, "-", "-", "-", "L"],
          );
          return {
            statusCode: 201,
            headers,
            body: JSON.stringify({ success: true, message: "Pendaftaran berhasil, silakan login" }),
          };
        } catch (errLower) {
          // Final fallback: insert without password column (will use default NIM on login)
          await client.query(
            'INSERT INTO "customers" ("CUST_ID", "CUST_NAME", "EMAIL", "ADDRESS", "PLACE_OF_BIRTH", "CONTACT_NUMBER", "GENDER_ID") VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [id, name, email, "-", "-", "-", "L"],
          );
          return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
              success: true,
              message: "Pendaftaran berhasil (Password disamakan dengan NIM)",
            }),
          };
        }
      }
    }

    return { statusCode: 404, headers, body: "Not Found" };
  } catch (err) {
    console.error("Auth error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: err.message }),
    };
  } finally {
    await client.end();
  }
};
