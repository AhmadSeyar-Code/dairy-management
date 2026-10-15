import prisma from "../config/prisma.js";

export const createExpense = async (req, res) => {
  try {
    const { title, amount, description } = req.body;

    const expense = await prisma.expense.create({
      data: {
        title,
        amount,
        description,
      },
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create expense",
    });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: {
        id: "desc",
      },
    });

    res.json(expenses);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get expenses",
    });
  }
};

export const getExpense = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get expense",
    });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, amount, description } = req.body;

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        title,
        amount,
        description,
      },
    });

    res.json(expense);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update expense",
    });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.expense.delete({
      where: { id },
    });

    res.json({
      message: "Expense deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete expense",
    });
  }
};
