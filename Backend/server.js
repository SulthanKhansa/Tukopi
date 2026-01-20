import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

// Import Routes
import productsRoutes from "./routes/productsRoutes.js";
import customersRoutes from "./routes/customersRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import cashierRoutes from "./routes/cashierRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

const app = express();
const port = process.env.SERVER_PORT || 5000;

app.use(cors());
app.use(express.json());

// Main Route
app.get("/", (req, res) => {
  res.send("Server Backend Tukopi Berjalan!");
});

// API Routes
app.use("/api/products", productsRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cashiers", cashierRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
