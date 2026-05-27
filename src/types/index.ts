export type UserRole = 'particulier' | 'prestataire' | 'admin'

export interface User {
  id: number
  nom: string
  prenom: string
  email: string
  telephone: string
  role: UserRole
  avatar?: string
}

export interface Categorie {
  id: number
  nom: string
  description: string
  icone: string
  count?: number
}

export interface Prestation {
  id: number
  titre: string
  description: string
  prix: number
  disponibilite: boolean
  datepublication: string
  prestataire: User
  categorie: Categorie
  note?: number
  avisCount?: number
}

export interface DemandeService {
  id: number
  titre: string
  description: string
  dateIntervention: string
  statut: 'en_attente' | 'acceptee' | 'en_cours' | 'terminee' | 'annulee'
  localisation: string
  montant: number
  adresseIntervention: string
  particulier: User
  prestataire?: User
}

export interface Avis {
  id: number
  note: number
  commentaire: string
  dateAvis: string
  auteur: User
  prestataire: User
}

export interface Notification {
  id: number
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  lu: boolean
  createdAt: string
}
