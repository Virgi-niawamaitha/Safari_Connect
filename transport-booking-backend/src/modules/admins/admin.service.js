import { prisma } from "../../config/prisma.js";

export const getPlatformStats = async () => {
  const [
    totalUsers,
    activeUsers,
    totalSaccos,
    activeSaccos,
    totalBookings,
    confirmedBookings,
    totalPayments,
    activeTrips,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "ACTIVE" } }),
    prisma.sacco.count(),
    prisma.sacco.count({ where: { isActive: true } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "SUCCESS" } }),
    prisma.trip.count({ where: { status: "SCHEDULED" } }),
  ]);

  return {
    totalUsers,
    activeUsers,
    totalSaccos,
    activeSaccos,
    totalBookings,
    confirmedBookings,
    grossRevenue: Number(totalPayments._sum.amount || 0),
    activeTrips,
  };
};

export const getAllUsers = async ({ page = 1, limit = 50, role, status } = {}) => {
  const where = {};
  if (role) where.role = role;
  if (status) where.status = status;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, firstName: true, lastName: true,
        email: true, phone: true, role: true, status: true,
        isVerified: true, createdAt: true,
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, limit };
};

export const getAllBookings = async ({ page = 1, limit = 50, status } = {}) => {
  const where = status ? { status } : {};

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        trip: { include: { sacco: true, route: true } },
        seat: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ]);

  return { bookings, total, page, limit };
};

export const getAllSaccos = async () => {
  return prisma.sacco.findMany({
    include: {
      category: true,
      ownerProfile: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
      _count: { select: { buses: true, trips: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getAllPayments = async ({ page = 1, limit = 50, status } = {}) => {
  const where = status ? { status } : {};

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        booking: { include: { trip: { include: { sacco: true, route: true } }, seat: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.payment.count({ where }),
  ]);

  return { payments, total, page, limit };
};

export const setUserStatus = async (userId, status) => {
  const allowed = ["ACTIVE", "INACTIVE", "SUSPENDED"];
  if (!allowed.includes(status)) throw new Error("Invalid status");

  return prisma.user.update({
    where: { id: userId },
    data: { status },
    select: { id: true, firstName: true, lastName: true, email: true, status: true },
  });
};

export const setSaccoStatus = async (saccoId, isActive) => {
  return prisma.sacco.update({
    where: { id: saccoId },
    data: { isActive },
    include: { category: true },
  });
};
