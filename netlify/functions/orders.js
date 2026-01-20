const { Client } = require('pg');

exports.handler = async (event, context) => {
  const dbUrl = process.env.NETLIFY_DATABASE_URL;

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
      },
      body: ''
    };
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // GET ALL ORDERS OR STATS (For Admin)
    if (event.httpMethod === 'GET') {
      const isStats = event.path.endsWith('/stats');

      if (isStats) {
        const statsRes = await client.query(`
          SELECT 
            COUNT(*) as total_orders, 
            COALESCE(SUM("TOTAL"), 0) as total_revenue,
            (SELECT COUNT(*) FROM "customers") as total_customers,
            (SELECT COUNT(*) FROM "products") as total_products
          FROM "orders"
        `);
        return {
          statusCode: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ data: statsRes.rows[0] })
        };
      }

      const res = await client.query(`
        SELECT 
          o."ORDER_ID" AS id, 
          o."ORDER_DATE" AS tanggal, 
          c."CUST_NAME" AS pelanggan, 
          ca."USERNAME" AS kasir, 
          o."TOTAL" AS total, 
          m."METHOD" AS metode_pembayaran,
          o."BANK_TRANS" AS bank,
          o."RECEIPT_NUMBER" AS nomor_nota
        FROM "orders" o
        LEFT JOIN "customers" c ON o."CUST_ID" = c."CUST_ID"
        LEFT JOIN "cashiers" ca ON o."USER_ID" = ca."USER_ID"
        LEFT JOIN "payment_methods" m ON o."METHOD_ID" = m."METHOD_ID"
        ORDER BY o."ORDER_DATE" DESC
      `);
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ data: res.rows })
      };
    }

    // CREATE NEW ORDER
    if (event.httpMethod === 'POST') {
      const { orderDate, custId, userId, methodId, total, items } = JSON.parse(event.body);
    await client.connect();

    // Start Transaction
    await client.query('BEGIN');

    // 1. Insert into orders
    const orderSql = `
      INSERT INTO "orders" ("ORDER_DATE", "CUST_ID", "USER_ID", "TOTAL", "METHOD_ID") 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING "ORDER_ID"
    `;
    const orderRes = await client.query(orderSql, [
      orderDate,
      custId === 'admin' ? '-NoName-' : (custId || '-NoName-'),
      userId || '12345678',
      total,
      methodId || '1'
    ]);

    const orderId = orderRes.rows[0].ORDER_ID;

    // 2. Insert into order_details
    for (const item of items) {
      await client.query(
        'INSERT INTO "order_details" ("ORDER_ID", "PRODUCT_ID", "QTY", "PRICE") VALUES ($1, $2, $3, $4)',
        [orderId, item.productId, item.qty, item.price]
      );
      
      // 3. Update stock
      await client.query(
        'UPDATE "products" SET "STOCK" = "STOCK" - $1 WHERE "PRODUCT_ID" = $2',
        [item.qty, item.productId]
      );
    }

    await client.query('COMMIT');

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        success: true,
        message: "Order berhasil dibuat (Neon)",
        orderId: orderId
      }),
    };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Order error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: err.message }),
    };
  } finally {
    await client.end();
  }
};
