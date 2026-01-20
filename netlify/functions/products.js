const { Client } = require("pg");

exports.handler = async (event, context) => {
  // Ambil URL dari Environment variable yang diminta Netlify
  const dbUrl = process.env.NETLIFY_DATABASE_URL;

  if (!dbUrl) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "NETLIFY_DATABASE_URL is not defined" }),
    };
  }

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // GET: List all products
    if (event.httpMethod === "GET") {
      const result = await client.query(`
        SELECT 
          p."PRODUCT_ID" AS "PRODUCT_ID", 
          p."PRODUCT_NAME" AS "PRODUCT_NAME", 
          p."PRICE" AS "PRICE", 
          c."CATEGORY" AS "CATEGORY", 
          p."CATEGORY_ID" AS "CATEGORY_ID",
          p."STOCK" AS "STOCK" 
        FROM "products" p
        LEFT JOIN "product_categories" c ON p."CATEGORY_ID" = c."CATEGORY_ID"
        ORDER BY p."PRODUCT_ID" ASC
      `);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ data: result.rows }),
      };
    }

    // POST: Create new product
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body);
      const { product_id, product_name, category_id, price, stock } = body;

      // Handle ID: If it's a number, or null/empty string, we handle it accordingly.
      // In Postgres, if it's SERIAL/IDENTITY, we omit it from the insert.
      const query = `
        INSERT INTO "products" ("PRODUCT_NAME", "CATEGORY_ID", "PRICE", "STOCK", "CREATED_AT", "CREATED_BY", "UPDATED_AT", "UPDATED_BY")
        VALUES ($1, $2, $3, $4, NOW(), 'ADMIN', NOW(), 'ADMIN')
        RETURNING "PRODUCT_ID"
      `;
      const result = await client.query(query, [
        product_name,
        category_id,
        price,
        stock || 0,
      ]);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: "Produk berhasil ditambahkan",
          id: result.rows[0].PRODUCT_ID,
        }),
      };
    }

    // PUT: Update product
    if (event.httpMethod === "PUT") {
      const id = event.path.split("/").pop();
      const body = JSON.parse(event.body);
      const { product_name, category_id, price, stock } = body;

      await client.query(
        `
        UPDATE "products" 
        SET "PRODUCT_NAME" = $1, "CATEGORY_ID" = $2, "PRICE" = $3, "STOCK" = $4, "UPDATED_AT" = NOW(), "UPDATED_BY" = 'ADMIN'
        WHERE "PRODUCT_ID" = $5
      `,
        [product_name, category_id, price, stock, id],
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: "Produk berhasil diupdate",
        }),
      };
    }

    // DELETE: Delete product
    if (event.httpMethod === "DELETE") {
      const id = event.path.split("/").pop();
      await client.query('DELETE FROM "products" WHERE "PRODUCT_ID" = $1', [
        id,
      ]);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: "Produk berhasil dihapus",
        }),
      };
    }

    return { statusCode: 405, headers, body: "Method Not Allowed" };
  } catch (err) {
    console.error("Database error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "Gagal mengambil data dari Neon",
        error: err.message,
      }),
    };
  } finally {
    await client.end();
  }
};
