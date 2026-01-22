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
      const isStats = event.path.endsWith("/stats") || event.queryStringParameters.type === "stats";
      const isReports = event.path.endsWith("/reports") || event.queryStringParameters.type === "reports";

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
            title:
              "1. Produk yang paling banyak dibeli beserta jumlahnya pada tahun sebelumnya",
            query: `SELECT p."PRODUCT_ID", p."PRODUCT_NAME", penjualan_produk.total_terjual
                    FROM "products" p
                    JOIN (
                        SELECT od."PRODUCT_ID", SUM(od."QTY") AS total_terjual
                        FROM "order_details" od
                        JOIN "orders" o ON od."ORDER_ID" = o."ORDER_ID"
                        WHERE EXTRACT(YEAR FROM o."ORDER_DATE") = EXTRACT(YEAR FROM CURRENT_DATE) - 1
                        GROUP BY od."PRODUCT_ID"
                    ) AS penjualan_produk ON p."PRODUCT_ID" = penjualan_produk."PRODUCT_ID"
                    ORDER BY penjualan_produk.total_terjual DESC`,
          },
          {
            title:
              "2. Siapa saja yang paling banyak melakukan order beserta jumlahnya pada tahun sebelumnya",
            query: `SELECT c."CUST_ID", c."CUST_NAME", total_transaksi.jumlah_order
                    FROM "customers" c
                    JOIN (
                        SELECT "CUST_ID", COUNT("ORDER_ID") AS jumlah_order
                        FROM "orders"
                        WHERE EXTRACT(YEAR FROM "ORDER_DATE") = EXTRACT(YEAR FROM CURRENT_DATE) - 1
                        GROUP BY "CUST_ID"
                    ) AS total_transaksi ON c."CUST_ID" = total_transaksi."CUST_ID"
                    ORDER BY total_transaksi.jumlah_order DESC`,
          },
          {
            title:
              "3. Siapa saja yang paling besar nilai ordenya beserta nominalnya pada tahun sebelumnya",
            query: `SELECT c."CUST_ID", c."CUST_NAME", nominal_order.total_nominal
                    FROM "customers" c
                    JOIN (
                        SELECT "CUST_ID", SUM("TOTAL") AS total_nominal
                        FROM "orders"
                        WHERE EXTRACT(YEAR FROM "ORDER_DATE") = EXTRACT(YEAR FROM CURRENT_DATE) - 1
                        GROUP BY "CUST_ID"
                    ) AS nominal_order ON c."CUST_ID" = nominal_order."CUST_ID"
                    ORDER BY nominal_order.total_nominal DESC`,
          },
          {
            title:
              "4. Siapa saja yang jumlah item produk ordernya paling banyak beserta jumlahnya pada tahun sebelumnya",
            query: `SELECT c."CUST_ID", c."CUST_NAME", belanja_item.total_qty
                    FROM "customers" c
                    JOIN (
                        SELECT o."CUST_ID", SUM(od."QTY") AS total_qty
                        FROM "orders" o
                        JOIN "order_details" od ON o."ORDER_ID" = od."ORDER_ID"
                        WHERE EXTRACT(YEAR FROM o."ORDER_DATE") = EXTRACT(YEAR FROM CURRENT_DATE) - 1
                        GROUP BY o."CUST_ID"
                    ) AS belanja_item ON c."CUST_ID" = belanja_item."CUST_ID"
                    ORDER BY belanja_item.total_qty DESC`,
          },
          {
            title:
              "5. 10 produk terlaris beserta jumlahnya pada tahun sebelumnya",
            query: `SELECT p."PRODUCT_ID", p."PRODUCT_NAME", penjualan_produk.total_terjual
                    FROM "products" p
                    JOIN (
                        SELECT od."PRODUCT_ID", SUM(od."QTY") AS total_terjual
                        FROM "order_details" od
                        JOIN "orders" o ON od."ORDER_ID" = o."ORDER_ID"
                        WHERE EXTRACT(YEAR FROM o."ORDER_DATE") = EXTRACT(YEAR FROM CURRENT_DATE) - 1
                        GROUP BY od."PRODUCT_ID"
                    ) AS penjualan_produk ON p."PRODUCT_ID" = penjualan_produk."PRODUCT_ID"
                    ORDER BY penjualan_produk.total_terjual DESC LIMIT 10`,
          },
          {
            title:
              "6. tampilan profit penjualan bulanan di tahun sebelumnya untuk setiap produk",
            query: `SELECT 
                      laporan_profit.bulan,
                      p."PRODUCT_NAME",
                      laporan_profit.total_profit
                    FROM "products" p
                    JOIN (
                        SELECT 
                            EXTRACT(MONTH FROM o."ORDER_DATE") AS bulan,
                            od."PRODUCT_ID",
                            SUM((od."PRICE" * od."QTY")) AS total_profit
                        FROM "order_details" od
                        JOIN "orders" o ON od."ORDER_ID" = o."ORDER_ID"
                        JOIN "products" p2 ON od."PRODUCT_ID" = p2."PRODUCT_ID"
                        WHERE EXTRACT(YEAR FROM o."ORDER_DATE") = EXTRACT(YEAR FROM CURRENT_DATE) - 1
                        GROUP BY bulan, od."PRODUCT_ID"
                    ) AS laporan_profit ON p."PRODUCT_ID" = laporan_profit."PRODUCT_ID"
                    ORDER BY laporan_profit.bulan ASC, laporan_profit.total_profit DESC`,
          },
          {
            title:
              "7. tampilan jumlah penjualan bulanan di tahun sebelumnya untuk setiap produk",
            query: `SELECT 
                      p."PRODUCT_ID", 
                      p."PRODUCT_NAME", 
                      penjualan_bulanan.bulan, 
                      penjualan_bulanan.total_qty
                    FROM "products" p
                    JOIN (
                        SELECT 
                            od."PRODUCT_ID", 
                            EXTRACT(MONTH FROM o."ORDER_DATE") AS bulan, 
                            SUM(od."QTY") AS total_qty
                        FROM "order_details" od
                        JOIN "orders" o ON od."ORDER_ID" = o."ORDER_ID"
                        WHERE EXTRACT(YEAR FROM o."ORDER_DATE") = EXTRACT(YEAR FROM CURRENT_DATE) - 1
                        GROUP BY od."PRODUCT_ID", bulan
                    ) AS penjualan_bulanan ON p."PRODUCT_ID" = penjualan_bulanan."PRODUCT_ID"
                    ORDER BY penjualan_bulanan.bulan ASC, penjualan_bulanan.total_qty DESC`,
          },
          {
            title:
              "8. tampilan jumlah order bulanan di tahun sebelumnya untuk setiap customer",
            query: `SELECT 
                      c."CUST_ID", 
                      c."CUST_NAME", 
                      order_bulanan.bulan, 
                      order_bulanan.jumlah_transaksi
                    FROM "customers" c
                    JOIN (
                        SELECT 
                            "CUST_ID", 
                            EXTRACT(MONTH FROM "ORDER_DATE") AS bulan, 
                            COUNT("ORDER_ID") AS jumlah_transaksi
                        FROM "orders"
                        WHERE EXTRACT(YEAR FROM "ORDER_DATE") = EXTRACT(YEAR FROM CURRENT_DATE) - 1
                        GROUP BY "CUST_ID", bulan
                    ) AS order_bulanan ON c."CUST_ID" = order_bulanan."CUST_ID"
                    ORDER BY order_bulanan.bulan ASC, order_bulanan.jumlah_transaksi DESC`,
          },
          {
            title:
              "9. tampilan total nominal order bulanan di tahun sebelumnya untuk setiap customer",
            query: `SELECT 
                      c."CUST_ID", 
                      c."CUST_NAME", 
                      nominal_bulanan.bulan, 
                      nominal_bulanan.total_pembayaran
                    FROM "customers" c
                    JOIN (
                        SELECT 
                            "CUST_ID", 
                            EXTRACT(MONTH FROM "ORDER_DATE") AS bulan, 
                            SUM("TOTAL") AS total_pembayaran
                        FROM "orders"
                        WHERE EXTRACT(YEAR FROM "ORDER_DATE") = EXTRACT(YEAR FROM CURRENT_DATE) - 1
                        GROUP BY "CUST_ID", bulan
                    ) AS nominal_bulanan ON c."CUST_ID" = nominal_bulanan."CUST_ID"
                    ORDER BY nominal_bulanan.bulan ASC, nominal_bulanan.total_pembayaran DESC`,
          },
          {
            title:
              "10. tampilan jumlah layanan bulanan di tahun sebelumnya untuk setiap kasir",
            query: `SELECT 
                      cs."USER_ID", 
                      cs."USERNAME" AS nama_kasir, 
                      layanan_bulanan.bulan, 
                      layanan_bulanan.total_layanan
                    FROM "cashiers" cs
                    JOIN (
                        SELECT 
                            "USER_ID", 
                            EXTRACT(MONTH FROM "ORDER_DATE") AS bulan, 
                            COUNT("ORDER_ID") AS total_layanan
                        FROM "orders"
                        WHERE EXTRACT(YEAR FROM "ORDER_DATE") = EXTRACT(YEAR FROM CURRENT_DATE) - 1
                        GROUP BY "USER_ID", bulan
                    ) AS layanan_bulanan ON cs."USER_ID" = layanan_bulanan."USER_ID"
                    ORDER BY layanan_bulanan.bulan ASC, layanan_bulanan.total_layanan DESC`,
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
