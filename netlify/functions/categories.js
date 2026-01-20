const { Client } = require('pg');

exports.handler = async (event, context) => {
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
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
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
    
    // GET: List all categories
    if (event.httpMethod === 'GET') {
      const result = await client.query('SELECT "CATEGORY_ID", "CATEGORY" FROM "product_categories" ORDER BY "CATEGORY_ID" ASC');
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, data: result.rows }) };
    }

    // POST: Create new category
    if (event.httpMethod === 'POST') {
      const { id, name } = JSON.parse(event.body);
      await client.query('INSERT INTO "product_categories" ("CATEGORY_ID", "CATEGORY") VALUES ($1, $2)', [id, name]);
      return { statusCode: 201, headers, body: JSON.stringify({ success: true, message: "Kategori berhasil ditambahkan" }) };
    }

    // PUT: Update category
    if (event.httpMethod === 'PUT') {
      const categoryId = event.path.split('/').pop();
      const { name } = JSON.parse(event.body);
      await client.query('UPDATE "product_categories" SET "CATEGORY" = $1 WHERE "CATEGORY_ID" = $2', [name, categoryId]);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: "Kategori berhasil diupdate" }) };
    }

    // DELETE: Delete category
    if (event.httpMethod === 'DELETE') {
      const categoryId = event.path.split('/').pop();
      await client.query('DELETE FROM "product_categories" WHERE "CATEGORY_ID" = $1', [categoryId]);
      return { statusCode: 200, headers, body: JSON.stringify({ success: true, message: "Kategori berhasil dihapus" }) };
    }
  } catch (err) {
    console.error("Database error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  } finally {
    await client.end();
  }
};
