const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAllItems = async () => {
  return prisma.portfolioItem.findMany({
    include: { user: { select: { id: true, name: true } } },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
  });
};

const getItemsByUser = async (userId) => {
  return prisma.portfolioItem.findMany({
    where: { userId },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
  });
};

const getItemById = async (id) => {
  return prisma.portfolioItem.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true } } },
  });
};

const createItem = async (userId, data) => {
  return prisma.portfolioItem.create({
    data: { ...data, userId },
  });
};

const updateItem = async (id, userId, role, data) => {
  const item = await prisma.portfolioItem.findUnique({ where: { id } });
  if (!item) {
    const error = new Error('Portfolio item not found');
    error.status = 404;
    throw error;
  }
  if (item.userId !== userId && role !== 'ADMIN') {
    const error = new Error('Forbidden');
    error.status = 403;
    throw error;
  }
  return prisma.portfolioItem.update({ where: { id }, data });
};

const deleteItem = async (id, userId, role) => {
  const item = await prisma.portfolioItem.findUnique({ where: { id } });
  if (!item) {
    const error = new Error('Portfolio item not found');
    error.status = 404;
    throw error;
  }
  if (item.userId !== userId && role !== 'ADMIN') {
    const error = new Error('Forbidden');
    error.status = 403;
    throw error;
  }
  return prisma.portfolioItem.delete({ where: { id } });
};

module.exports = { getAllItems, getItemsByUser, getItemById, createItem, updateItem, deleteItem };
