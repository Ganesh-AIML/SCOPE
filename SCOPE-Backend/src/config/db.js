const { PrismaClient } = require('@prisma/client');

// Prisma automatically handles connection pooling under the hood!
const prisma = new PrismaClient();

module.exports = prisma;