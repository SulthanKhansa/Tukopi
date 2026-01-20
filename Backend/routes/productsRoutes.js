import express from "express";
import { 
    getProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct 
} from "../controllers/productsController.js";

const router = express.Router();

// READ
router.get('/', getProducts);
router.get('/:id', getProductById);

// CREATE
router.post('/', createProduct);

// UPDATE (Pakai method PUT)
// URL contoh: http://localhost:3000/api/products/10
router.put('/:id', updateProduct);

// DELETE (Pakai method DELETE)
// URL contoh: http://localhost:3000/api/products/10
router.delete('/:id', deleteProduct);

export default router;