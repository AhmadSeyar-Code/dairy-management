import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const protect = (req, res, next) => {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not configured");

    return res.status(500).json({
      message: "Server security configuration error",
    });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      !decoded ||
      typeof decoded !== "object" ||
      !decoded.id ||
      !decoded.role
    ) {
      return res.status(401).json({
        message: "Invalid token payload",
      });
    }

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  next();
};

export const customerOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (req.user.role !== "customer") {
    return res.status(403).json({ message: "Customer access required" });
  }

  next();
};

export const staffOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (req.user.role !== "admin" && req.user.role !== "employee") {
    return res.status(403).json({ message: "Staff access required" });
  }

  next();
};
