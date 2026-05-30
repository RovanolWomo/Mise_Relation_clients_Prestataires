const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = [
    { nom: 'Plomberie', description: 'Installation et réparation de tuyauterie', icone: 'plumbing-icon' },
    { nom: 'Électricité', description: 'Mise aux normes et dépannage électrique', icone: 'electric-icon' },
    { nom: 'Maçonnerie', description: 'Construction et rénovation en dur', icone: 'masonry-icon' },
    { nom: 'Peinture', description own: 'Peinture intérieure et extérieure', icone: 'paint-icon' },
    { nom: 'Climatisation', description: 'Installation et entretien de clim', icone: 'ac-icon' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { nom: cat.nom },
      update: {},
      create: cat,
    });
  }

  console.log('Categories seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
