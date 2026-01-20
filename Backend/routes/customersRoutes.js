import express from "express";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerOrders,
} from "../controllers/customersController.js";

const router = express.Router();

router.get("/", getCustomers);
router.get("/:id", getCustomerById);
router.get("/:id/orders", getCustomerOrders);
router.post("/", createCustomer); // Tambah
router.put("/:id", updateCustomer); // Edit
router.delete("/:id", deleteCustomer); // Hapus

export default router;
