const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const adminExists = await prisma.user.findUnique({
    where: { email: 'admin@pizzaria.com' },
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@pizzaria.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log('Seed: Admin user created.');
  } else {
    console.log('Seed: Admin user already exists.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
