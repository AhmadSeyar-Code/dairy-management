import prisma from "../config/prisma.js";

export const createProduct = async (req, res) => {
  try {
    const { name, category, unit, buyPrice, sellPrice, stock } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        category,
        unit,
        buyPrice,
        sellPrice,
        stock: stock || 0,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create product",
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        id: "desc",
      },
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get products",
    });
  }
};

export const getProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get product",
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const { name, category, unit, buyPrice, sellPrice, stock } = req.body;

    const product = await prisma.product.update({
      where: {
        id,
      },
      data: {
        name,
        category,
        unit,
        buyPrice,
        sellPrice,
        stock,
      },
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.product.delete({
      where: {
        id,
      },
    });

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
    });
  }
};