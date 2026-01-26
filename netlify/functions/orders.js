const { Client } = require("pg");

exports.handler = async (event, context) => {
  const dbUrl = process.env.NETLIFY_DATABASE_URL;

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      },
      body: "",
    };
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    // GET ALL ORDERS OR STATS OR REPORTS (For Admin)
    if (event.httpMethod === "GET") {
      const isStats =
        event.path.endsWith("/stats") ||
        event.queryStringParameters.type === "stats";
      const isReports =
        event.path.endsWith("/reports") ||
        event.queryStringParameters.type === "reports";

      if (isStats) {
        const statsRes = await client.query(`
          SELECT 
            COUNT(*) as total_orders, 
            COALESCE(SUM("TOTAL"), 0) as total_revenue,
            (SELECT COUNT(*) FROM "customers") as total_customers,
            (SELECT COALESCE(SUM("QTY"), 0) FROM "order_details") as total_sold
          FROM "orders"
        `);

        const recentRes = await client.query(`
          SELECT 
            o."ORDER_ID" AS id, o."ORDER_DATE" AS tanggal, 
            c."CUST_NAME" AS pelanggan, ca."USERNAME" AS kasir, 
            o."TOTAL" AS total, m."METHOD" AS metode_pembayaran
          FROM "orders" o
          LEFT JOIN "customers" c ON o."CUST_ID" = c."CUST_ID"
          LEFT JOIN "cashiers" ca ON o."USER_ID" = ca."USER_ID"
          LEFT JOIN "payment_methods" m ON o."METHOD_ID" = m."METHOD_ID"
          ORDER BY o."ORDER_DATE" DESC LIMIT 5
        `);

        return {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: {
              stats: {
                ...statsRes.rows[0],
                total_products: statsRes.rows[0].total_sold,
              },
              transactions: recentRes.rows,
            },
          }),
        };
      }

      if (isReports) {
        const reportConfigs = [
          {
            title: "1. Produk Terlaris Tahun Sebelumnya",
            query: `SELECT * FROM (
                SELECT 
                  (SELECT "PRODUCT_NAME" FROM "products" WHERE "PRODUCT_ID" = od."PRODUCT_ID") AS nama_produk, 
                  SUM("QTY") AS jumlah
                FROM "order_details" od
                WHERE (SELECT EXTRACT(YEAR FROM "ORDER_DATE") FROM "orders" WHERE "ORDER_ID" = od."ORDER_ID") = EXTRACT(YEAR FROM CURRENT_DATE) - 1
                GROUP BY od."PRODUCT_ID"
            ) AS rekap
            WHERE jumlah = (
                SELECT MAX(total_qty) 
                FROM (
                    SELECT SUM("QTY") AS total_qty 
                    FROM "order_details" od2
                    WHERE (SELECT EXTRACT(YEAR FROM "ORDER_DATE") FROM "orders" WHERE "ORDER_ID" = od2."ORDER_ID") = EXTRACT(YEAR FROM CURRENT_DATE) - 1
                    GROUP BY od2."PRODUCT_ID"
                ) AS tabel_bantu
            )`,
          },
          {
            title: "2. Customer paling banyak order",
            query: `SELECT c."CUST_NAME", COUNT(o."ORDER_ID") AS total_order
                    FROM "customers" c
                    JOIN "orders" o ON c."CUST_ID" = o."CUST_ID"
                    WHERE EXTRACT(YEAR FROM o."ORDER_DATE") = EXTRACT(YEAR FROM CURRENT_DATE) - 1
                    GROUP BY c."CUST_ID", c."CUST_NAME"
                    HAVING COUNT(o."ORDER_ID") = (
                      SELECT MAX(jumlah_order)
                      FROM (
                        SELECT COUNT("ORDER_ID") AS jumlah_order
                        FROM "orders"
                        WHERE EXTRACT(YEAR FROM "ORDER_DATE") = EXTRACT(YEAR FROM CURRENT_DATE) - 1
                        GROUP BY "CUST_ID"
                      ) t
                    )`,
          },
          {
            title: "3. Customer nilai order terbesar",
            query: `SELECT c."CUST_NAME", SUM(od."QTY" * od."PRICE") AS total_nilai_order
                    FROM "customers" c
                    JOIN "orders" o ON c."CUST_ID" = o."CUST_ID"
                    JOIN "order_details" od ON o."ORDER_ID" = od."ORDER_ID"
                    WHERE EXTRACT(YEAR FROM o."ORDER_DATE") = EXTRACT(YEAR FROM CURRENT_DATE) - 1
                    GROUP BY c."CUST_ID", c."CUST_NAME"
                    HAVING SUM(od."QTY" * od."PRICE") = (
                      SELECT MAX(total_nilai)
                      FROM (
                        SELECT SUM(od2."QTY" * od2."PRICE") AS total_nilai
                        FROM "orders" o2
                        JOIN "order_details" od2 ON o2."ORDER_ID" = od2."ORDER_ID"
                        WHERE EXTRACT(YEAR FROM o2."ORDER_DATE") = EXTRACT(YEAR FROM CURRENT_DATE) - 1
                        GROUP BY o2."CUST_ID"
                      ) t
                    )`,
          },
          {
            title: "4. Customer jumlah item terbanyak",
            query: `SELECT c."CUST_NAME", SUM(od."QTY") AS total_item
                    FROM "customers" c
                    JOIN "orders" o ON c."CUST_ID" = o."CUST_ID"
                    JOIN "order_details" od ON o."ORDER_ID" = od."ORDER_ID"
                    WHERE EXTRACT(YEAR FROM o."ORDER_DATE") = EXTRACT(YEAR FROM CURRENT_DATE) - 1
                    GROUP BY c."CUST_ID", c."CUST_NAME"
                    HAVING SUM(od."QTY") = (
                      SELECT MAX(jumlah_item)
                      FROM (
                        SELECT SUM(od2."QTY") AS jumlah_item
                        FROM "orders" o2
                        JOIN "order_details" od2 ON o2."ORDER_ID" = od2."ORDER_ID"
                        WHERE EXTRACT(YEAR FROM o2."ORDER_DATE") = EXTRACT(YEAR FROM CURRENT_DATE) - 1
                        GROUP BY o2."CUST_ID"
                      ) t
                    )`,
          },
          {
            title: "5. 10 produk terlaris",
            query: `SELECT p."PRODUCT_NAME", SUM(od."QTY") AS total_terjual
                    FROM "products" p
                    JOIN "order_details" od ON p."PRODUCT_ID" = od."PRODUCT_ID"
                    JOIN "orders" o ON od."ORDER_ID" = o."ORDER_ID"
                    WHERE EXTRACT(YEAR FROM o."ORDER_DATE") = EXTRACT(YEAR FROM CURRENT_DATE) - 1
                    GROUP BY p."PRODUCT_ID", p."PRODUCT_NAME"
                    ORDER BY total_terjual DESC
                    LIMIT 10`,
          },
          {
            title: "6. Profit bulanan per produk",
            query: `SELECT p."PRODUCT_NAME",
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=1 THEN od."QTY"*od."PRICE" ELSE 0 END) AS Januari,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=2 THEN od."QTY"*od."PRICE" ELSE 0 END) AS Februari,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=3 THEN od."QTY"*od."PRICE" ELSE 0 END) AS Maret,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=4 THEN od."QTY"*od."PRICE" ELSE 0 END) AS April,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=5 THEN od."QTY"*od."PRICE" ELSE 0 END) AS Mei,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=6 THEN od."QTY"*od."PRICE" ELSE 0 END) AS Juni,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=7 THEN od."QTY"*od."PRICE" ELSE 0 END) AS Juli,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=8 THEN od."QTY"*od."PRICE" ELSE 0 END) AS Agustus,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=9 THEN od."QTY"*od."PRICE" ELSE 0 END) AS September,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=10 THEN od."QTY"*od."PRICE" ELSE 0 END) AS Oktober,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=11 THEN od."QTY"*od."PRICE" ELSE 0 END) AS November,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=12 THEN od."QTY"*od."PRICE" ELSE 0 END) AS Desember
                    FROM "products" p
                    JOIN "order_details" od ON p."PRODUCT_ID" = od."PRODUCT_ID"
                    JOIN "orders" o ON od."ORDER_ID" = o."ORDER_ID"
                    WHERE EXTRACT(YEAR FROM o."ORDER_DATE")=EXTRACT(YEAR FROM CURRENT_DATE)-1
                    GROUP BY p."PRODUCT_ID", p."PRODUCT_NAME"`,
          },
          {
            title: "7. Jumlah penjualan bulanan per produk",
            query: `SELECT p."PRODUCT_NAME",
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=1 THEN od."QTY" ELSE 0 END) AS Januari,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=2 THEN od."QTY" ELSE 0 END) AS Februari,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=3 THEN od."QTY" ELSE 0 END) AS Maret,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=4 THEN od."QTY" ELSE 0 END) AS April,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=5 THEN od."QTY" ELSE 0 END) AS Mei,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=6 THEN od."QTY" ELSE 0 END) AS Juni,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=7 THEN od."QTY" ELSE 0 END) AS Juli,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=8 THEN od."QTY" ELSE 0 END) AS Agustus,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=9 THEN od."QTY" ELSE 0 END) AS September,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=10 THEN od."QTY" ELSE 0 END) AS Oktober,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=11 THEN od."QTY" ELSE 0 END) AS November,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=12 THEN od."QTY" ELSE 0 END) AS Desember
                    FROM "products" p
                    JOIN "order_details" od ON p."PRODUCT_ID" = od."PRODUCT_ID"
                    JOIN "orders" o ON od."ORDER_ID" = o."ORDER_ID"
                    WHERE EXTRACT(YEAR FROM o."ORDER_DATE")=EXTRACT(YEAR FROM CURRENT_DATE)-1
                    GROUP BY p."PRODUCT_ID", p."PRODUCT_NAME"`,
          },
          {
            title: "8. Order bulanan per customer",
            query: `SELECT c."CUST_NAME",
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=1 THEN 1 ELSE 0 END) AS Januari,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=2 THEN 1 ELSE 0 END) AS Februari,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=3 THEN 1 ELSE 0 END) AS Maret,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=4 THEN 1 ELSE 0 END) AS April,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=5 THEN 1 ELSE 0 END) AS Mei,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=6 THEN 1 ELSE 0 END) AS Juni,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=7 THEN 1 ELSE 0 END) AS Juli,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=8 THEN 1 ELSE 0 END) AS Agustus,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=9 THEN 1 ELSE 0 END) AS September,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=10 THEN 1 ELSE 0 END) AS Oktober,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=11 THEN 1 ELSE 0 END) AS November,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=12 THEN 1 ELSE 0 END) AS Desember
                    FROM "customers" c
                    LEFT JOIN "orders" o ON c."CUST_ID" = o."CUST_ID"
                    AND EXTRACT(YEAR FROM o."ORDER_DATE")=EXTRACT(YEAR FROM CURRENT_DATE)-1
                    GROUP BY c."CUST_ID", c."CUST_NAME"`,
          },
          {
            title: "9. Nominal order bulanan per customer",
            query: `SELECT c."CUST_NAME",
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=1 THEN od."QTY"*od."PRICE" ELSE 0 END) AS Januari,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=2 THEN od."QTY"*od."PRICE" ELSE 0 END) AS Februari,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=3 THEN od."QTY"*od."PRICE" ELSE 0 END) AS Maret,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=4 THEN od."QTY"*od."PRICE" ELSE 0 END) AS April,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=5 THEN od."QTY"*od."PRICE" ELSE 0 END) AS Mei,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=6 THEN od."QTY"*od."PRICE" ELSE 0 END) AS Juni,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=7 THEN od."QTY"*od."PRICE" ELSE 0 END) AS Juli,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=8 THEN od."QTY"*od."PRICE" ELSE 0 END) AS Agustus,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=9 THEN od."QTY"*od."PRICE" ELSE 0 END) AS September,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=10 THEN od."QTY"*od."PRICE" ELSE 0 END) AS Oktober,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=11 THEN od."QTY"*od."PRICE" ELSE 0 END) AS November,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=12 THEN od."QTY"*od."PRICE" ELSE 0 END) AS Desember
                    FROM "customers" c
                    JOIN "orders" o ON c."CUST_ID" = o."CUST_ID"
                    JOIN "order_details" od ON o."ORDER_ID" = od."ORDER_ID"
                    WHERE EXTRACT(YEAR FROM o."ORDER_DATE")=EXTRACT(YEAR FROM CURRENT_DATE)-1
                    GROUP BY c."CUST_ID", c."CUST_NAME"`,
          },
          {
            title: "10. Layanan bulanan per kasir",
            query: `SELECT c."EMAIL",
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=1 THEN 1 ELSE 0 END) AS Januari,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=2 THEN 1 ELSE 0 END) AS Februari,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=3 THEN 1 ELSE 0 END) AS Maret,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=4 THEN 1 ELSE 0 END) AS April,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=5 THEN 1 ELSE 0 END) AS Mei,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=6 THEN 1 ELSE 0 END) AS Juni,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=7 THEN 1 ELSE 0 END) AS Juli,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=8 THEN 1 ELSE 0 END) AS Agustus,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=9 THEN 1 ELSE 0 END) AS September,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=10 THEN 1 ELSE 0 END) AS Oktober,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=11 THEN 1 ELSE 0 END) AS November,
                      SUM(CASE WHEN EXTRACT(MONTH FROM o."ORDER_DATE")=12 THEN 1 ELSE 0 END) AS Desember
                    FROM "cashiers" c
                    JOIN "orders" o ON c."USER_ID" = o."USER_ID"
                    WHERE EXTRACT(YEAR FROM o."ORDER_DATE")=EXTRACT(YEAR FROM CURRENT_DATE)-1
                    GROUP BY c."USER_ID", c."EMAIL"`,
          },
        ];

        const results = [];
        for (const config of reportConfigs) {
          const res = await client.query(config.query);
          results.push({ title: config.title, data: res.rows });
        }

        return {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ success: true, data: results }),
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
          o."RECEIPT_NUMBER" AS nomor_nota,
          o."CUST_ID" AS cust_id,
          o."USER_ID" AS user_id,
          o."METHOD_ID" AS method_id
        FROM "orders" o
        LEFT JOIN "customers" c ON o."CUST_ID" = c."CUST_ID"
        LEFT JOIN "cashiers" ca ON o."USER_ID" = ca."USER_ID"
        LEFT JOIN "payment_methods" m ON o."METHOD_ID" = m."METHOD_ID"
        ORDER BY o."ORDER_DATE" DESC
      `);
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: res.rows }),
      };
    }

    // CREATE NEW ORDER
    if (event.httpMethod === "POST") {
      const { orderDate, custId, userId, methodId, total, items } = JSON.parse(
        event.body,
      );

      await client.query("BEGIN");

      const orderSql = `
        INSERT INTO "orders" ("ORDER_DATE", "CUST_ID", "USER_ID", "TOTAL", "METHOD_ID") 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING "ORDER_ID"
      `;

      // Jika userId tidak ada, ambil random dari tabel cashiers
      let finalUserId = userId;
      if (!finalUserId) {
        const randomCashier = await client.query(
          'SELECT "USER_ID" FROM "cashiers" ORDER BY RANDOM() LIMIT 1',
        );
        finalUserId = randomCashier.rows[0]?.USER_ID || "12345678";
      }

      const orderRes = await client.query(orderSql, [
        orderDate || new Date(),
        custId || "-NoName-",
        finalUserId,
        total,
        methodId || "1",
      ]);

      const orderId = orderRes.rows[0].ORDER_ID;

      if (items && items.length > 0) {
        for (const item of items) {
          await client.query(
            'INSERT INTO "order_details" ("ORDER_ID", "PRODUCT_ID", "QTY", "PRICE") VALUES ($1, $2, $3, $4)',
            [orderId, item.productId, item.qty, item.price],
          );

          await client.query(
            'UPDATE "products" SET "STOCK" = "STOCK" - $1 WHERE "PRODUCT_ID" = $2',
            [item.qty, item.productId],
          );
        }
      }

      await client.query("COMMIT");

      return {
        statusCode: 201,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          success: true,
          message: "Order created",
          orderId,
        }),
      };
    }

    // UPDATE ORDER
    if (event.httpMethod === "PUT") {
      const id = event.path.split("/").pop();
      const { total, methodId, bank, receipt } = JSON.parse(event.body);

      await client.query(
        `
        UPDATE "orders" 
        SET "TOTAL" = $1, "METHOD_ID" = $2, "BANK_TRANS" = $3, "RECEIPT_NUMBER" = $4
        WHERE "ORDER_ID" = $5
      `,
        [total, methodId, bank, receipt, id],
      );

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ success: true, message: "Updated" }),
      };
    }

    // DELETE ORDER
    if (event.httpMethod === "DELETE") {
      const id = event.path.split("/").pop();
      await client.query('DELETE FROM "order_details" WHERE "ORDER_ID" = $1', [
        id,
      ]);
      await client.query('DELETE FROM "orders" WHERE "ORDER_ID" = $1', [id]);
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ success: true, message: "Deleted" }),
      };
    }
  } catch (err) {
    if (event.httpMethod === "POST") await client.query("ROLLBACK");
    console.error("Order error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ success: false, message: err.message }),
    };
  } finally {
    await client.end();
  }
};
