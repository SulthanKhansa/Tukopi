const { Client } = require("pg");

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

    // GET: Fetch all cashiers
    if (event.httpMethod === "GET") {
      const result = await client.query(
        'SELECT "USER_ID", "USERNAME", "EMAIL", "CONTACT_NUMBER", "ADDRESS", "PLACE_OF_BIRTH", "DATE_OF_BIRTH", "GENDER_ID" FROM "cashiers" ORDER BY "USERNAME" ASC',
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: result.rows,
        }),
      };
    }

    // POST: Create new cashier
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body);
      const {
        user_id,
        username,
        email,
        contact_number,
        address,
        place_of_birth,
        date_of_birth,
        gender_id,
        password,
      } = body;

      await client.query(
        `
        INSERT INTO "cashiers" ("USER_ID", "USERNAME", "EMAIL", "CONTACT_NUMBER", "ADDRESS", "PLACE_OF_BIRTH", "DATE_OF_BIRTH", "GENDER_ID", "PASSWORD", "CREATED_AT", "UPDATED_AT")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      `,
        [
          user_id,
          username,
          email,
          contact_number,
          address,
          place_of_birth,
          date_of_birth,
          gender_id,
          password || "Indonesia",
        ],
      );

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, message: "Cashier created" }),
      };
    }

    // PUT: Update cashier
    if (event.httpMethod === "PUT") {
      const id = event.path.split("/").pop();
      const body = JSON.parse(event.body);
      const {
        username,
        email,
        contact_number,
        address,
        place_of_birth,
        date_of_birth,
        gender_id,
      } = body;

      await client.query(
        `
        UPDATE "cashiers" SET 
          "USERNAME" = $1, "EMAIL" = $2, "CONTACT_NUMBER" = $3, 
          "ADDRESS" = $4, "PLACE_OF_BIRTH" = $5, "DATE_OF_BIRTH" = $6, 
          "GENDER_ID" = $7, "UPDATED_AT" = NOW()
        WHERE "USER_ID" = $8
      `,
        [
          username,
          email,
          contact_number,
          address,
          place_of_birth,
          date_of_birth,
          gender_id,
          id,
        ],
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: "Cashier updated" }),
      };
    }

    // DELETE: Delete cashier
    if (event.httpMethod === "DELETE") {
      const id = event.path.split("/").pop();
      await client.query('DELETE FROM "cashiers" WHERE "USER_ID" = $1', [id]);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: "Cashier deleted" }),
      };
    }

    return { statusCode: 405, headers, body: "Method Not Allowed" };
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
