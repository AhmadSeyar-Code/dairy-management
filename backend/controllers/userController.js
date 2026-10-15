import prisma from "../config/prisma.js";

export const getEmployees = async (_req, res) => {
  try {
    const employees = await prisma.user.findMany({
      where: { role: "employee" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json(employees);
  } catch (error) {
    console.error("Get employees error:", error);
    return res.status(500).json({ message: "Failed to get employees" });
  }
};
