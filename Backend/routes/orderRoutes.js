import express from "express";
import {
  getOrders,
  getOrderDetails,
  getDashboardStats,
  createOrder,
} from "../controllers/ordersController.js";

const router = express.Router();

// Route Utama (List semua order)
router.get("/", getOrders);

// Route Dashboard (Stats)
router.get("/dashboard/stats", getDashboardStats);

// Route Create Order
router.post("/", createOrder);

// Route Detail (Melihat isi kopi apa saja dalam 1 order)
// Contoh akses: /api/orders/2255
router.get("/:id", getOrderDetails);

export default router;
