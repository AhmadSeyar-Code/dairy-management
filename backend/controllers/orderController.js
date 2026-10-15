import prisma from "../config/prisma.js";

const orderDetails = {
  customer: {
    select: {
      id: true,
      name: true,
      phone: true,
      address: true,
      user: { select: { email: true } },
    },
  },
  items: {
    include: { product: { select: { id: true, name: true, unit: true } } },
  },
};

const asCents = (value) => Math.round(Number(value) * 100);
const fromCents = (value) => (value / 100).toFixed(2);
const isPositiveId = (value) => Number.isSafeInteger(Number(value)) && Number(value) > 0;

const parseOrderId = (value) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

export const getOrderProfile = async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { userId: req.user.id },
      select: { id: true, name: true, phone: true, address: true },
    });

    if (!customer) {
      return res.status(404).json({ message: "Customer profile not found" });
    }

    return res.json(customer);
  } catch (error) {
    console.error("Get customer order profile error:", error);
    return res.status(500).json({ message: "Failed to load customer profile" });
  }
};

export const createOrder = async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const { items, name, phone, deliveryAddress, notes } = body;

    if (!Array.isArray(items) || items.length < 1 || items.length > 50) {
      return res.status(400).json({ message: "Add between 1 and 50 order items" });
    }
    if (typeof name !== "string" || !name.trim() || name.trim().length > 100) {
      return res.status(400).json({ message: "A valid customer name is required" });
    }
    if (typeof phone !== "string" || !phone.trim() || phone.trim().length > 40) {
      return res.status(400).json({ message: "A valid phone number is required" });
    }
    if (
      typeof deliveryAddress !== "string" ||
      !deliveryAddress.trim() ||
      deliveryAddress.trim().length > 2000
    ) {
      return res.status(400).json({ message: "A valid delivery address is required" });
    }
    if (notes != null && (typeof notes !== "string" || notes.length > 2000)) {
      return res.status(400).json({ message: "Order notes must be 2000 characters or less" });
    }

    const quantities = new Map();
    for (const item of items) {
      const productId = Number(item?.productId);
      const quantity = Number(item?.quantity);
      if (!isPositiveId(productId) || !Number.isFinite(quantity) || quantity <= 0 || quantity > 99999999) {
        return res.status(400).json({ message: "Each item needs a valid product and quantity" });
      }
      const quantityCents = asCents(quantity);
      if (quantityCents <= 0 || Math.abs(quantity * 100 - quantityCents) > 0.00001) {
        return res.status(400).json({ message: "Quantities may have up to 2 decimal places" });
      }
      quantities.set(productId, (quantities.get(productId) || 0) + quantityCents);
    }

    const created = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({
        where: { userId: req.user.id },
      });
      if (!customer) {
        const error = new Error("Customer profile not found");
        error.statusCode = 404;
        throw error;
      }

      const products = await tx.product.findMany({
        where: { id: { in: [...quantities.keys()] } },
        select: { id: true, name: true, unit: true, sellPrice: true, stock: true },
      });
      const productById = new Map(products.map((product) => [product.id, product]));
      const orderItems = [];
      let totalCents = 0;

      for (const [productId, quantityCents] of quantities) {
        const product = productById.get(productId);
        if (!product) {
          const error = new Error(`Product ${productId} was not found`);
          error.statusCode = 404;
          throw error;
        }

        if (quantityCents > asCents(product.stock)) {
          const error = new Error(`Not enough stock for ${product.name}`);
          error.statusCode = 409;
          throw error;
        }

        const unitPriceCents = asCents(product.sellPrice);
        const subtotalCents = Math.round((quantityCents * unitPriceCents) / 100);
        totalCents += subtotalCents;
        orderItems.push({
          productId,
          productName: product.name,
          unit: product.unit,
          quantity: fromCents(quantityCents),
          unitPrice: fromCents(unitPriceCents),
          subtotal: fromCents(subtotalCents),
        });
      }

      if (totalCents > 9999999999) {
        const error = new Error("Order total exceeds the supported maximum");
        error.statusCode = 400;
        throw error;
      }

      await tx.customer.update({
        where: { id: customer.id },
        data: {
          name: name.trim(),
          phone: phone.trim(),
          address: deliveryAddress.trim(),
        },
      });

      return tx.order.create({
        data: {
          customerId: customer.id,
          phone: phone.trim(),
          deliveryAddress: deliveryAddress.trim(),
          notes: notes?.trim() || null,
          totalAmount: fromCents(totalCents),
          items: { create: orderItems },
        },
        include: orderDetails,
      });
    });

    return res.status(201).json(created);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Create order error:", error);
    return res.status(500).json({ message: "Failed to create order" });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customer: { is: { userId: req.user.id } } },
      include: orderDetails,
      orderBy: { createdAt: "desc" },
    });
    return res.json(orders);
  } catch (error) {
    console.error("Get customer orders error:", error);
    return res.status(500).json({ message: "Failed to load orders" });
  }
};

export const getMyOrder = async (req, res) => {
  const id = parseOrderId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid order ID" });

  try {
    const order = await prisma.order.findFirst({
      where: { id, customer: { is: { userId: req.user.id } } },
      include: orderDetails,
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.json(order);
  } catch (error) {
    console.error("Get customer order error:", error);
    return res.status(500).json({ message: "Failed to load order" });
  }
};

export const cancelMyOrder = async (req, res) => {
  const id = parseOrderId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid order ID" });

  try {
    const result = await prisma.order.updateMany({
      where: {
        id,
        status: "pending",
        customer: { is: { userId: req.user.id } },
      },
      data: { status: "cancelled" },
    });
    if (result.count !== 1) {
      const ownedOrder = await prisma.order.findFirst({
        where: { id, customer: { is: { userId: req.user.id } } },
        select: { id: true },
      });
      return res.status(ownedOrder ? 409 : 404).json({
        message: ownedOrder
          ? "Only pending orders can be cancelled by the customer"
          : "Order not found",
      });
    }
    const order = await prisma.order.findUnique({ where: { id }, include: orderDetails });
    return res.json(order);
  } catch (error) {
    console.error("Cancel customer order error:", error);
    return res.status(500).json({ message: "Failed to cancel order" });
  }
};

export const getAllOrders = async (_req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: orderDetails,
      orderBy: { createdAt: "desc" },
    });
    return res.json(orders);
  } catch (error) {
    console.error("Get all orders error:", error);
    return res.status(500).json({ message: "Failed to load orders" });
  }
};

export const getOrder = async (req, res) => {
  const id = parseOrderId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid order ID" });

  try {
    const order = await prisma.order.findUnique({ where: { id }, include: orderDetails });
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.json(order);
  } catch (error) {
    console.error("Get order error:", error);
    return res.status(500).json({ message: "Failed to load order" });
  }
};

const allowedTransitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
};

export const updateOrderStatus = async (req, res) => {
  const id = parseOrderId(req.params.id);
  const nextStatus = req.body?.status;
  if (!id) return res.status(400).json({ message: "Invalid order ID" });
  if (!Object.hasOwn(allowedTransitions, nextStatus)) {
    return res.status(400).json({ message: "Invalid order status" });
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });
      if (!current) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        throw error;
      }
      if (!allowedTransitions[current.status].includes(nextStatus)) {
        const error = new Error(`Cannot change order from ${current.status} to ${nextStatus}`);
        error.statusCode = 409;
        throw error;
      }

      const claimed = await tx.order.updateMany({
        where: { id, status: current.status },
        data: { status: nextStatus },
      });
      if (claimed.count !== 1) {
        const error = new Error("Order was updated by another administrator");
        error.statusCode = 409;
        throw error;
      }

      if (nextStatus === "confirmed") {
        for (const item of current.items) {
          const reserved = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (reserved.count !== 1) {
            const error = new Error("There is not enough stock to confirm this order");
            error.statusCode = 409;
            throw error;
          }
        }
      }

      if (nextStatus === "cancelled" && ["confirmed", "preparing"].includes(current.status)) {
        for (const item of current.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      if (nextStatus === "delivered") {
        const sale = await tx.sale.create({
          data: {
            customerId: current.customerId,
            totalAmount: current.totalAmount,
            items: {
              create: current.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.unitPrice,
                subtotal: item.subtotal,
              })),
            },
          },
        });
        await tx.order.update({ where: { id }, data: { saleId: sale.id } });
      }

      return tx.order.findUnique({ where: { id }, include: orderDetails });
    });

    return res.json(order);
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error("Update order status error:", error);
    return res.status(500).json({ message: "Failed to update order" });
  }
};
