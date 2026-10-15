import prisma from "../config/prisma.js";

export const createSale = async (req, res) => {
  try {
    const { customerId, items } = req.body || {};
    if (!Array.isArray(items) || items.length < 1 || items.length > 50) {
      return res.status(400).json({ message: "Add between 1 and 50 sale items" });
    }

    const quantities = new Map();
    for (const item of items) {
      const productId = Number(item?.productId);
      const quantity = Number(item?.quantity);
      const quantityCents = Math.round(quantity * 100);
      if (!Number.isSafeInteger(productId) || productId <= 0 ||
          !Number.isFinite(quantity) || quantity <= 0 || quantity > 99999999 ||
          Math.abs(quantity * 100 - quantityCents) > 0.00001) {
        return res.status(400).json({ message: "Each item needs a valid product and quantity" });
      }
      quantities.set(productId, (quantities.get(productId) || 0) + quantityCents);
    }

    const normalizedCustomerId = customerId == null || customerId === "" ? null : Number(customerId);
    if (normalizedCustomerId !== null &&
        (!Number.isSafeInteger(normalizedCustomerId) || normalizedCustomerId <= 0)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    const sale = await prisma.$transaction(async (tx) => {
      if (normalizedCustomerId !== null) {
        const customer = await tx.customer.findUnique({ where: { id: normalizedCustomerId }, select: { id: true } });
        if (!customer) {
          const error = new Error("Customer not found");
          error.statusCode = 404;
          throw error;
        }
      }

      const products = await tx.product.findMany({
        where: { id: { in: [...quantities.keys()] } },
        select: { id: true, name: true, sellPrice: true },
      });
      const byId = new Map(products.map((product) => [product.id, product]));
      const saleItems = [];
      let totalCents = 0;

      for (const [productId, quantityCents] of quantities) {
        const product = byId.get(productId);
        if (!product) {
          const error = new Error(`Product ${productId} not found`);
          error.statusCode = 404;
          throw error;
        }
        const unitPriceCents = Math.round(Number(product.sellPrice) * 100);
        const subtotalCents = Math.round(quantityCents * unitPriceCents / 100);
        totalCents += subtotalCents;
        saleItems.push({
          productId,
          quantity: (quantityCents / 100).toFixed(2),
          price: (unitPriceCents / 100).toFixed(2),
          subtotal: (subtotalCents / 100).toFixed(2),
        });
      }
      if (totalCents > 9999999999) {
        const error = new Error("Sale total exceeds the supported maximum");
        error.statusCode = 400;
        throw error;
      }

      for (const [productId, quantityCents] of quantities) {
        const quantity = (quantityCents / 100).toFixed(2);
        const updated = await tx.product.updateMany({
          where: { id: productId, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        });
        if (updated.count !== 1) {
          const error = new Error(`Not enough stock for ${byId.get(productId).name}`);
          error.statusCode = 409;
          throw error;
        }
      }

      return tx.sale.create({
        data: {
          customerId: normalizedCustomerId,
          totalAmount: (totalCents / 100).toFixed(2),
          items: { create: saleItems },
        },
        include: { items: true },
      });
    });

    return res.status(201).json(sale);
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ message: error.message });
    console.error("Create sale error:", error);
    return res.status(500).json({ message: "Failed to create sale" });
  }
};

export const getSales = async (_req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: { items: { include: { product: true } }, customer: true },
      orderBy: { saleDate: "desc" },
    });
    return res.json(sales);
  } catch (error) {
    console.error("Get sales error:", error);
    return res.status(500).json({ message: "Failed to get sales" });
  }
};

export const getSale = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid sale ID" });
  }

  try {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, customer: true },
    });
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    return res.json(sale);
  } catch (error) {
    console.error("Get sale error:", error);
    return res.status(500).json({ message: "Failed to get sale" });
  }
};
