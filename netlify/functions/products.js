const { Client } = require('pg');

exports.handler = async (event, context) => {
  // Ambil URL dari Environment variable yang diminta Netlify
  const dbUrl = process.env.NETLIFY_DATABASE_URL;

  if (!dbUrl) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "NETLIFY_DATABASE_URL is not defined" }),
    };
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false // Penting untuk Neon
    }
  });

  try {
    await client.connect();
    
    // Gunakan ALIAS agar kolom tetap huruf besar (untuk kecocokan dengan kode frontend MySQL sebelumnya)
    const result = await client.query(`
      SELECT 
        product_id AS "PRODUCT_ID", 
        product_name AS "PRODUCT_NAME", 
        price AS "PRICE", 
        category AS "CATEGORY", 
        category_id AS "CATEGORY_ID",
        stock AS "STOCK" 
      FROM products
    `);
    
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, OPTION"
      },
      body: JSON.stringify({
        message: "Data Produk dari Neon",
        data: result.rows
      }),
    };
  } catch (err) {
    console.error("Database error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        message: "Gagal mengambil data dari Neon",
        error: err.message 
      }),
    };
  } finally {
    await client.end();
  }
};
