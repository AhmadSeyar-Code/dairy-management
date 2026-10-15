import prisma from "../config/prisma.js";

export const createSupplier = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const supplier = await prisma.supplier.create({
      data: {
        name,
        phone,
        address,
      },
    });

    res.status(201).json(supplier);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create supplier",
    });
  }
};

export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: {
        id: "desc",
      },
    });

    res.json(suppliers);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get suppliers",
    });
  }
};

export const getSupplier = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      return res.status(404).json({
        message: "Supplier not found",
      });
    }

    res.json(supplier);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get supplier",
    });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, phone, address } = req.body;

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name,
        phone,
        address,
      },
    });

    res.json(supplier);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update supplier",
    });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.supplier.delete({
      where: { id },
    });

    res.json({
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete supplier",
    });
  }
};