import express from "express";
import { adminOnly } from "../middleware/authMiddleware.js";

import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.post("/", adminOnly, createProduct);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.put("/:id", adminOnly, updateProduct);
router.delete("/:id", adminOnly, deleteProduct);

export default router;
