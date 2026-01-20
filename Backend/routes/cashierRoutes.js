import express from "express";
import { 
    getCashiers, 
    getCashierById, 
    createCashier, 
    updateCashier, 
    deleteCashier 
} from "../controllers/cashierController.js"; // Pastikan path & nama file controller benar

const router = express.Router();

router.get('/', getCashiers);
router.get('/:id', getCashierById);
router.post('/', createCashier);
router.put('/:id', updateCashier);
router.delete('/:id', deleteCashier);

export default router;