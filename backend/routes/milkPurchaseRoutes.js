import express from "express";

import {
  createMilkPurchase,
  getMilkPurchases,
} from "../controllers/milkPurchaseController.js";

const router = express.Router();

router.post("/", createMilkPurchase);
router.get("/", getMilkPurchases);

export default router;
