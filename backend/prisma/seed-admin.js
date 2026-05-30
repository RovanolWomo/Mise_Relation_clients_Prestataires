require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@prestolink.cm';
  const password = 'Admin@Prestolink2026';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('✅ Admin déjà en base :', email);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const admin = await prisma.user.create({
    data: {
      email,
      password: hashed,
      nom: 'Admin',
      prenom: 'Prestolink',
      telephone: '+237 000 000 000',
      role: 'ADMIN',
      verified: true,
      statut: 'ACTIF',
    },
  });

  console.log('✅ Admin créé avec succès');
  console.log('   Email    :', admin.email);
  console.log('   Mot de passe :', password);
  console.log('   Rôle     :', admin.role);
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
