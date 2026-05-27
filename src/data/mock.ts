import type { Categorie, Prestation, User } from '../types'

export const categories: Categorie[] = [
  { id: 1, nom: 'Plomberie',     description: 'Réparation et installation sanitaire',     icone: 'droplets',  count: 48 },
  { id: 2, nom: 'Électricité',   description: 'Installation et dépannage électrique',      icone: 'zap',       count: 62 },
  { id: 3, nom: 'Menuiserie',    description: 'Travaux de bois et ameublement',            icone: 'hammer',    count: 35 },
  { id: 4, nom: 'Peinture',      description: 'Peinture intérieure et extérieure',         icone: 'paintbrush',count: 41 },
  { id: 5, nom: 'Climatisation', description: 'Installation et entretien de clim',         icone: 'wind',      count: 29 },
  { id: 6, nom: 'Informatique',  description: 'Dépannage PC, réseau et logiciels',         icone: 'monitor',   count: 53 },
  { id: 7, nom: 'Jardinage',     description: 'Entretien espaces verts et jardins',        icone: 'trees',     count: 22 },
  { id: 8, nom: 'Maçonnerie',    description: 'Construction et rénovation',                icone: 'building',  count: 17 },
]

export const prestataires: User[] = [
  { id: 1, nom: 'Mbeki',          prenom: 'Alain',   email: 'alain@mail.com',    telephone: '+237 6 70 00 00 01', role: 'prestataire', avatar: 'AM' },
  { id: 2, nom: 'Ngo Biya',       prenom: 'Sandrine', email: 'sandrine@mail.com', telephone: '+237 6 70 00 00 02', role: 'prestataire', avatar: 'SN' },
  { id: 3, nom: 'Tchamou',        prenom: 'Eric',     email: 'eric@mail.com',     telephone: '+237 6 70 00 00 03', role: 'prestataire', avatar: 'ET' },
  { id: 4, nom: 'Foupouagnigni',  prenom: 'Diane',    email: 'diane@mail.com',    telephone: '+237 6 70 00 00 04', role: 'prestataire', avatar: 'DF' },
]

export const prestations: Prestation[] = [
  {
    id: 1,
    titre: "Réparation fuite d'eau urgente",
    description: 'Intervention rapide pour toute fuite, robinetterie, tuyaux, siphon.',
    prix: 15000, disponibilite: true, datepublication: '2026-05-20',
    prestataire: prestataires[0], categorie: categories[0], note: 4.8, avisCount: 34,
  },
  {
    id: 2,
    titre: 'Installation tableau électrique',
    description: 'Mise aux normes et installation de tableau divisionnaire.',
    prix: 45000, disponibilite: true, datepublication: '2026-05-18',
    prestataire: prestataires[1], categorie: categories[1], note: 4.9, avisCount: 57,
  },
  {
    id: 3,
    titre: 'Dépannage PC & Réseau',
    description: 'Formatage, virus, configuration réseau, récupération données.',
    prix: 8000, disponibilite: true, datepublication: '2026-05-22',
    prestataire: prestataires[2], categorie: categories[5], note: 4.7, avisCount: 21,
  },
  {
    id: 4,
    titre: 'Peinture intérieure complète',
    description: 'Peinture de pièces, couleurs au choix, finitions soignées.',
    prix: 35000, disponibilite: false, datepublication: '2026-05-15',
    prestataire: prestataires[3], categorie: categories[3], note: 4.6, avisCount: 18,
  },
]

export const stats = {
  prestataires: 340,
  particuliers: 1200,
  interventions: 4800,
  satisfaction: 97,
}
