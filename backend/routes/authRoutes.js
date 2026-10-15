import express from "express";

import {
  register,
  registerCustomer,
  login,
  getCurrentUser,
} from "../controllers/authController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", protect, adminOnly, register);
router.post("/customer-register", registerCustomer);
router.post("/login", login);
router.get("/me", protect, getCurrentUser);

export default router;
