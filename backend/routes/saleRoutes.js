import express from "express";

import {
  createSale,
  getSales,
  getSale,
} from "../controllers/saleController.js";
import { protect, staffOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, staffOnly);

router.post("/", createSale);
router.get("/", getSales);
router.get("/:id", getSale);

export default router;
