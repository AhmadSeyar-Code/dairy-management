import express from "express";
import {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController.js";

import { adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCustomers);
router.get("/:id", getCustomer);

router.post("/", adminOnly, createCustomer);
router.put("/:id", adminOnly, updateCustomer);
router.delete("/:id", adminOnly, deleteCustomer);

export default router;
