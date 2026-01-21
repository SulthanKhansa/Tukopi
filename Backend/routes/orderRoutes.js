import express from "express";
import {
  getOrders,
  getOrderDetails,
  getDashboardStats,
  getDashboardReports,
  createOrder,
} from "../controllers/ordersController.js";

const router = express.Router();

// Route Utama (List semua order)
router.get("/", getOrders);

// Route Dashboard (Stats)
router.get("/dashboard/stats", getDashboardStats);

// Route Dashboard Reports (10 Analysis)
router.get("/dashboard/reports", getDashboardReports);

// Route Create Order
router.post("/", createOrder);

// Route Update Order
router.put("/:id", updateOrder);

// Route Delete Order
router.delete("/:id", deleteOrder);

// Route Detail (Melihat isi kopi apa saja dalam 1 order)
// Contoh akses: /api/orders/2255
router.get("/:id", getOrderDetails);

export default router;
