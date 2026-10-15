import prisma from "../config/prisma.js";

export const createCustomer = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        address,
      },
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create customer",
    });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        id: "desc",
      },
    });

    res.json(customers);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get customers",
    });
  }
};

export const getCustomer = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get customer",
    });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const { name, phone, address } = req.body;

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        phone,
        address,
      },
    });

    res.json(customer);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update customer",
    });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.customer.delete({
      where: { id },
    });

    res.json({
      message: "Customer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete customer",
    });
  }
};