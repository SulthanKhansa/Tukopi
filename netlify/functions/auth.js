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
        'SELECT * FROM "cashiers" WHERE "USER_ID" = $1 OR "USERNAME" = $2',
        [id, id],
      );
      if (cashierRes.rows.length > 0) {
        const user = cashierRes.rows[0];
        // Allow database password OR "admin" password as requested by user
        if (password === user.PASSWORD || password === "admin") {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              user: { id: user.USER_ID, name: user.USERNAME, role: "admin" },
            }),
          };
        }
      }

      // 2. Check Customers Table (Students)
      const customerRes = await client.query(
        'SELECT * FROM "customers" WHERE "CUST_ID" = $1',
        [id],
      );
      if (customerRes.rows.length > 0) {
        const user = customerRes.rows[0];
        // Password for student is their CUST_ID (NIM) if not set
        const dbPassword = user.PASSWORD || user.CUST_ID;

        if (password === dbPassword) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              user: {
                id: user.CUST_ID,
                name: user.CUST_NAME,
                email: user.EMAIL,
                role: "customer",
              },
            }),
          };
        }
      }

      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          message: "ID atau Password salah",
        }),
      };
    }

    // REGISTER LOGIC
    if (path.includes("/register")) {
      const { id, name, email, password } = body;

      const check = await client.query(
        'SELECT * FROM "customers" WHERE "CUST_ID" = $1',
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
        await client.query(
          'INSERT INTO "customers" ("CUST_ID", "CUST_NAME", "EMAIL", "PASSWORD", "ADDRESS", "PLACE_OF_BIRTH", "CONTACT_NUMBER", "GENDER_ID") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
          [id, name, email, password, "-", "-", "-", "L"],
        );
      } catch (insertErr) {
        // Fallback jika kolom PASSWORD belum ada di Postgres
        if (insertErr.message.includes('column "PASSWORD" does not exist')) {
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
        }
        throw insertErr; // Lempar error lain
      }

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: "Pendaftaran berhasil",
        }),
      };
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
