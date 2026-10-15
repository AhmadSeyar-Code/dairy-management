import prisma from "../config/prisma.js";

export const getDashboard = async (req, res) => {
  try {
    // تعداد محصولات
    const totalProducts = await prisma.product.count();

    // تعداد مشتریان
    const totalCustomers = await prisma.customer.count();

    // مجموع فروش
    const sales = await prisma.sale.aggregate({
      _sum: {
        totalAmount: true,
      },
    });

    // مجموع مصارف
    const expenses = await prisma.expense.aggregate({
      _sum: {
        amount: true,
      },
    });

    // مجموع خرید شیر
    const purchases = await prisma.milkPurchase.aggregate({
      _sum: {
        total: true,
      },
    });

    const totalSales = Number(sales._sum.totalAmount || 0);
    const totalExpenses = Number(expenses._sum.amount || 0);
    const totalPurchases = Number(purchases._sum.total || 0);

    // محاسبه سود
    const profit = totalSales - totalExpenses - totalPurchases;

    res.json({
      totalProducts,
      totalCustomers,
      totalSales,
      totalExpenses,
      totalPurchases,
      profit,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to get dashboard data",
    });
  }
};
