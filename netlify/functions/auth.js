const { Client } = require('pg');

exports.handler = async (event, context) => {
  const dbUrl = process.env.NETLIFY_DATABASE_URL;
  const path = event.path;

  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const body = JSON.parse(event.body);
    await client.connect();

    // LOGIN LOGIC
    if (path.includes('/login')) {
      const { id, password } = body;

      // Simple Admin Check
      if (id === 'admin' && password === 'admin') {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            user: { id: 'admin', name: 'Administrator TUKO', role: 'admin' }
          })
        };
      }

      // Check Customers
      const res = await client.query('SELECT * FROM customers WHERE CUST_ID = $1', [id]);
      if (res.rows.length === 0) {
        return { statusCode: 404, headers, body: JSON.stringify({ success: false, message: 'ID tidak ditemukan' }) };
      }

      const user = res.rows[0];
      // Note: In Postgres columns from PG might be lowercase if not quoted
      const dbPassword = user.password || user.cust_id;

      if (password === dbPassword) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            user: {
              id: user.cust_id,
              name: user.cust_name,
              email: user.email,
              role: user.cust_id === '24090022' ? 'admin' : 'customer'
            }
          })
        };
      } else {
        return { statusCode: 401, headers, body: JSON.stringify({ success: false, message: 'Password salah' }) };
      }
    }

    // REGISTER LOGIC
    if (path.includes('/register')) {
      const { id, name, email, password } = body;
      
      const check = await client.query('SELECT * FROM customers WHERE CUST_ID = $1', [id]);
      if (check.rows.length > 0) {
        return { statusCode: 400, headers, body: JSON.stringify({ success: false, message: 'ID sudah terdaftar' }) };
      }

      await client.query(
        'INSERT INTO customers (CUST_ID, CUST_NAME, EMAIL, PASSWORD) VALUES ($1, $2, $3, $4)',
        [id, name, email, password]
      );

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, message: 'Pendaftaran berhasil' })
      };
    }

    return { statusCode: 404, headers, body: 'Not Found' };

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
