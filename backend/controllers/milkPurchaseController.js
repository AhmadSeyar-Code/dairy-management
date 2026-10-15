import prisma from "../config/prisma.js";

export const createMilkPurchase = async (req, res) => {
  try {
    const { supplierId, quantity, price } = req.body;

    const total = Number(quantity) * Number(price);

    const purchase = await prisma.milkPurchase.create({
      data: {
        supplierId: Number(supplierId),
        quantity,
        price,
        total,
      },
    });

    res.status(201).json(purchase);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create milk purchase",
    });
  }
};

export const getMilkPurchases = async (req, res) => {
  try {
    const purchases = await prisma.milkPurchase.findMany({
      include: {
        supplier: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    res.json(purchases);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get milk purchases",
    });
  }
};