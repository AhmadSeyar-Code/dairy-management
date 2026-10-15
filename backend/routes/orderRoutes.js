import express from "express";
import { adminOnly, customerOnly, protect } from "../middleware/authMiddleware.js";
import {
  cancelMyOrder,
  createOrder,
  getAllOrders,
  getMyOrder,
  getMyOrders,
  getOrder,
  getOrderProfile,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

router.get("/profile", protect, customerOnly, getOrderProfile);
router.post("/", protect, customerOnly, createOrder);
router.get("/mine", protect, customerOnly, getMyOrders);
router.get("/mine/:id", protect, customerOnly, getMyOrder);
router.post("/mine/:id/cancel", protect, customerOnly, cancelMyOrder);

router.get("/", protect, adminOnly, getAllOrders);
router.get("/:id", protect, adminOnly, getOrder);
router.patch("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
