const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = [
    { nom: 'Plomberie',      description: 'Installation et réparation de tuyauterie', icone: 'plumbing-icon'   },
    { nom: 'Électricité',    description: 'Mise aux normes et dépannage électrique',  icone: 'electric-icon'   },
    { nom: 'Maçonnerie',     description: 'Construction et rénovation en dur',        icone: 'masonry-icon'    },
    { nom: 'Peinture',       description: 'Peinture intérieure et extérieure',        icone: 'paint-icon'      },
    { nom: 'Climatisation',  description: 'Installation et entretien de clim',        icone: 'ac-icon'         },
    { nom: 'Informatique',   description: 'Maintenance, réseau et cybersécurité',     icone: 'it-icon'         },
    { nom: 'Menuiserie',     description: 'Fabrication et pose de mobilier bois',     icone: 'carpentry-icon'  },
    { nom: 'Jardinage',      description: 'Entretien espaces verts et jardins',       icone: 'garden-icon'     },
    { nom: 'Nettoyage',      description: 'Nettoyage et ménage professionnel',        icone: 'cleaning-icon'   },
    { nom: 'Déménagement',   description: 'Transport et déménagement de mobilier',    icone: 'moving-icon'     },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { nom: cat.nom },
      update: {},
      create: cat,
    });
  }

  console.log('✅ Categories seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
