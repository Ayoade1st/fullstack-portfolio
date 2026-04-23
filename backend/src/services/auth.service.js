const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Parse a JWT-style duration string (e.g. "7d", "24h", "30m") into a future Date.
 */
const parseExpiry = (duration) => {
  const units = { s: 1, m: 60, h: 3600, d: 86400 };
  const match = String(duration).match(/^(\d+)([smhd])$/);
  if (!match) {
    // Fall back to 7 days if the format is unrecognised
    return new Date(Date.now() + 7 * 86400 * 1000);
  }
  const seconds = parseInt(match[1], 10) * (units[match[2]] || 86400);
  return new Date(Date.now() + seconds * 1000);
};

const register = async ({ name, email, password }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error('Email already in use');
    error.status = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const { accessToken, refreshToken } = await generateTokens(user);
  return { user, accessToken, refreshToken };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt };
  const { accessToken, refreshToken } = await generateTokens(safeUser);
  return { user: safeUser, accessToken, refreshToken };
};

const refresh = async (token) => {
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    const error = new Error('Invalid refresh token');
    error.status = 401;
    throw error;
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    const error = new Error('Refresh token expired or not found');
    error.status = 401;
    throw error;
  }

  await prisma.refreshToken.delete({ where: { token } });

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const tokens = await generateTokens(user);
  return tokens;
};

const logout = async (token) => {
  await prisma.refreshToken.deleteMany({ where: { token } });
};

const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  const expiresAt = parseExpiry(process.env.JWT_REFRESH_EXPIRES_IN || '7d');

  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id, expiresAt },
  });

  return { accessToken, refreshToken };
};

module.exports = { register, login, refresh, logout };
