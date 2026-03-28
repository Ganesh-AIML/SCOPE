// scripts/seed_admin.js
require('dotenv').config();
const prisma = require('../src/config/db');
const bcrypt = require('bcryptjs');

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("❌ ERROR: ADMIN_EMAIL or ADMIN_PASSWORD not found in .env");
    process.exit(1);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // upsert means: Update if exists, Create if it doesn't
  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      passwordHash
    },
    create: {
      name: 'System Root',
      email,
      passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    }
  });

  console.log(`✅ Master Key Active! Super Admin account ready: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });