const { Client } = require('pg');

exports.handler = async (event, context) => {
  const dbUrl = process.env.NETLIFY_DATABASE_URL;

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const { orderDate, custId, userId, methodId, total, items } = JSON.parse(event.body);
    await client.connect();

    // Start Transaction
    await client.query('BEGIN');

    // 1. Insert into orders
    const orderSql = `
      INSERT INTO orders (ORDER_DATE, CUST_ID, USER_ID, TOTAL, METHOD_ID) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING ORDER_ID
    `;
    const orderRes = await client.query(orderSql, [
      orderDate,
      custId === 'admin' ? '-NoName-' : (custId || '-NoName-'),
      userId || '12345678',
      total,
      methodId || '1'
    ]);

    const orderId = orderRes.rows[0].order_id;

    // 2. Insert into order_details
    for (const item of items) {
      await client.query(
        'INSERT INTO order_details (ORDER_ID, PRODUCT_ID, QTY, PRICE) VALUES ($1, $2, $3, $4)',
        [orderId, item.productId, item.qty, item.price]
      );
      
      // 3. Update stock
      await client.query(
        'UPDATE products SET STOCK = STOCK - $1 WHERE PRODUCT_ID = $2',
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
