require('dotenv').config();
const prisma = require('../src/config/db');

const normalize = (name) => {
  if (!name) return name;
  const lower = name.trim().toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

async function main() {
  console.log('--- Starting Department Normalization ---');

  // 1. Staff Profiles
  const staffArray = await prisma.staffProfile.findMany();
  for (const s of staffArray) {
    if (!s.department) continue;
    const clean = normalize(s.department);
    if (clean !== s.department) {
      console.log(`Updating Staff [${s.id}]: "${s.department}" -> "${clean}"`);
      await prisma.staffProfile.update({
        where: { id: s.id },
        data: { department: clean }
      });
    }
  }

  // 2. Student Profiles
  const studentsArray = await prisma.studentProfile.findMany();
  for (const s of studentsArray) {
    if (!s.branch) continue;
    const clean = normalize(s.branch);
    if (clean !== s.branch) {
      console.log(`Updating Student [${s.id}]: "${s.branch}" -> "${clean}"`);
      await prisma.studentProfile.update({
        where: { id: s.id },
        data: { branch: clean }
      });
    }
  }

  console.log('--- Normalization Complete ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });