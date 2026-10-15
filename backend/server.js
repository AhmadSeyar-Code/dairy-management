import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import prisma from "./config/prisma.js";
import { protect, adminOnly, staffOnly } from "./middleware/authMiddleware.js";

import productRoutes from "./routes/productRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import milkPurchaseRoutes from "./routes/milkPurchaseRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const app = express();
const PORT = Number(process.env.PORT) || 5003;

app.disable("x-powered-by");
app.use(helmet());

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // درخواست‌های بدون Origin مثل بعضی ابزارهای API
      // در CORS مرورگر محدود نمی‌شوند.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed"));
    },
  }),
);

app.use(express.json({ limit: "20kb" }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Try again later.",
  },
});

app.use("/api/auth", authLimiter, authRoutes);

// فقط مدیر
app.use("/api/products", protect, productRoutes);
app.use("/api/suppliers", protect, adminOnly, supplierRoutes);
app.use("/api/milk-purchases", protect, adminOnly, milkPurchaseRoutes);
app.use("/api/expenses", protect, adminOnly, expenseRoutes);
app.use("/api/reports", protect, adminOnly, reportRoutes);
app.use("/api/users", protect, adminOnly, userRoutes);
app.use("/api/orders", orderRoutes);

// کاربران Login شده
app.use("/api/customers", protect, adminOnly, customerRoutes);
app.use("/api/sales", protect, staffOnly, saleRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Dairy Management API is running",
  });
});

app.get("/api/admin", protect, adminOnly, (req, res) => {
  res.json({
    message: "Welcome Admin",
    user: req.user,
  });
});

app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "You have access to protected route",
    user: req.user,
  });
});

// این Endpoint فقط برای مدیر است.
app.get("/api/test-db", protect, adminOnly, async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      message: "Database connected successfully",
    });
  } catch (error) {
    console.error("Database test failed:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.message === "Origin not allowed") {
    return res.status(403).json({
      message: "Origin not allowed",
    });
  }

  console.error("Server error:", err);

  return res.status(500).json({
    message: "Internal server error",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
