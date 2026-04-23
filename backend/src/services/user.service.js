const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getMe = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
};

const getAllUsers = async () => {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
};

const updateUser = async (userId, data) => {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, role: true, updatedAt: true },
  });
};

const deleteUser = async (userId) => {
  return prisma.user.delete({ where: { id: userId } });
};

module.exports = { getMe, getAllUsers, updateUser, deleteUser };
