const { Client } = require('pg');

exports.handler = async (event, context) => {
  const dbUrl = process.env.NETLIFY_DATABASE_URL;
  const id = event.path.split('/').pop();
  const isOrdersRequest = event.path.endsWith('/orders');

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS"
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    if (event.httpMethod === 'GET') {
      // GET ALL CUSTOMERS (Admin)
      if (!id || id === 'customers') {
        const res = await client.query(`
          SELECT 
            "CUST_ID" AS "CUST_ID", 
            "CUST_NAME" AS "CUST_NAME", 
            "EMAIL" AS "EMAIL", 
            "CONTACT_NUMBER" AS "CONTACT_NUMBER",
            "ADDRESS" AS "ADDRESS"
          FROM "customers"
          ORDER BY "CUST_NAME" ASC
        `);
        return { statusCode: 200, headers, body: JSON.stringify({ data: res.rows }) };
      }

      if (isOrdersRequest) {
        // Get customer orders
        const custId = event.path.split('/')[event.path.split('/').length - 2];
        const res = await client.query(`
          SELECT 
            o."ORDER_ID" AS "ORDER_ID", 
            o."ORDER_DATE" AS "ORDER_DATE", 
            o."TOTAL" AS "TOTAL", 
            m."METHOD" AS "METODE_PEMBAYARAN"
          FROM "orders" o
          LEFT JOIN "payment_methods" m ON o."METHOD_ID" = m."METHOD_ID"
          WHERE o."CUST_ID" = $1
          ORDER BY o."ORDER_DATE" DESC
        `, [custId]);
        return { statusCode: 200, headers, body: JSON.stringify({ data: res.rows }) };
      } else {
        // Get customer profile
        const res = await client.query(`
          SELECT 
            "CUST_ID" AS "CUST_ID", 
            "CUST_NAME" AS "CUST_NAME", 
            "EMAIL" AS "EMAIL", 
            "ADDRESS" AS "ADDRESS", 
            "PLACE_OF_BIRTH" AS "PLACE_OF_BIRTH", 
            "DATE_OF_BIRTH" AS "DATE_OF_BIRTH", 
            "CONTACT_NUMBER" AS "CONTACT_NUMBER", 
            "GENDER_ID" AS "GENDER_ID"
          FROM "customers" WHERE "CUST_ID" = $1
        `, [id]);
        return { statusCode: 200, headers, body: JSON.stringify(res.rows[0] ? { data: res.rows[0] } : null) };
      }
    }

    if (event.httpMethod === 'PUT') {
      const data = JSON.parse(event.body);
      const updateSql = `
        UPDATE "customers" SET 
          "CUST_NAME" = $1, "EMAIL" = $2, "PLACE_OF_BIRTH" = $3, 
          "DATE_OF_BIRTH" = $4, "CONTACT_NUMBER" = $5, "ADDRESS" = $6, "GENDER_ID" = $7
        WHERE "CUST_ID" = $8
      `;
      await client.query(updateSql, [
        data.cust_name, data.email, data.place_of_birth,
        data.date_of_birth || null, data.contact_number, data.address, data.gender_id,
        id
      ]);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: "Berhasil Update!" }) };
    }

  } catch (err) {
    console.error("Customer error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  } finally {
    await client.end();
  }
};
