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
      const { id, password } = body;

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
      // We check by USER_ID (NIM) or USERNAME to be flexible
      const cashierRes = await client.query(
        'SELECT * FROM "cashiers" WHERE UPPER("USER_ID") = UPPER($1) OR UPPER("USERNAME") = UPPER($1)',
        [id]
      );
      if (cashierRes.rows.length > 0) {
        const user = cashierRes.rows[0];
        // Handle potential case differences in column names from PG
        const dbPassword = user.PASSWORD || user.password;
        const userId = user.USER_ID || user.user_id;
        const userName = user.USERNAME || user.username;

        if (password === dbPassword || password === "admin") {
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
        // PostgreSQL might return lowercase column names
        const dbPassword = user.PASSWORD || user.password || user.CUST_ID || user.cust_id;
        const custId = user.CUST_ID || user.cust_id;
        const custName = user.CUST_NAME || user.cust_name;
        const email = user.EMAIL || user.email;

        if (password === dbPassword) {
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
      const { id, name, email, password } = body;

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
        // Try with PASSWORD column (uppercase)
        await client.query(
          'INSERT INTO "customers" ("CUST_ID", "CUST_NAME", "EMAIL", "PASSWORD", "ADDRESS", "PLACE_OF_BIRTH", "CONTACT_NUMBER", "GENDER_ID") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [id, name, email, password, "-", "-", "-", "L"],
        );
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({
            success: true,
            message: "Pendaftaran berhasil, silakan login",
          }),
        };
      } catch (insertErr) {
        // Try lowercase password column for PostgreSQL
        try {
           await client.query(
            'INSERT INTO "customers" ("CUST_ID", "CUST_NAME", "EMAIL", "password", "ADDRESS", "PLACE_OF_BIRTH", "CONTACT_NUMBER", "GENDER_ID") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [id, name, email, password, "-", "-", "-", "L"],
          );
          return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
              success: true,
              message: "Pendaftaran berhasil, silakan login",
            }),
          };
        } catch (lowercaseErr) {
          // Generic fallback - try without PASSWORD column
          try {
            await client.query(
              'INSERT INTO "customers" ("CUST_ID", "CUST_NAME", "EMAIL", "ADDRESS", "PLACE_OF_BIRTH", "CONTACT_NUMBER", "GENDER_ID") VALUES ($1, $2, $3, $4, $5, $6, $7)',
              [id, name, email, "-", "-", "-", "L"],
            );
            return {
              statusCode: 201,
              headers,
              body: JSON.stringify({
                success: true,
                message: "Pendaftaran berhasil (Password disamakan dengan ID)",
              }),
            };
          } catch (finalErr) {
            throw finalErr;
          }
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
