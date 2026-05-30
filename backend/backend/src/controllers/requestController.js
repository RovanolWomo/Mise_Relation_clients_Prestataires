const prisma = require('../lib/prisma');

const createRequest = async (req, res) => {
  try {
    const {
      titre, description, categorie,
      date, dateIntervention,
      localisation, adresseIntervention,
      budget, montant,
      latitude, longitude,
    } = req.body;
    const particulierId = req.user.id;

    if (!titre || !description) {
      return res.status(400).json({ error: 'Titre et description sont obligatoires' });
    }

    const request = await prisma.request.create({
      data: {
        titre,
        description,
        categorie,
        dateIntervention: date ? new Date(date) : dateIntervention ? new Date(dateIntervention) : null,
        localisation: localisation || null,
        adresseIntervention: adresseIntervention || localisation || null,
        montant: montant ? parseFloat(montant) : budget ? parseFloat(budget) : null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        particulierId,
      },
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('createRequest:', error);
    res.status(500).json({ error: 'Échec de la création de la demande' });
  }
};

const getCustomerRequests = async (req, res) => {
  try {
    const requests = await prisma.request.findMany({
      where: { particulierId: req.user.id },
      include: {
        prestataire: { select: { id: true, nom: true, prenom: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Échec de la récupération des demandes' });
  }
};

const getProviderRequests = async (req, res) => {
  try {
    const requests = await prisma.request.findMany({
      where: { prestataireId: req.user.id },
      include: {
        particulier: { select: { id: true, nom: true, prenom: true, avatar: true, telephone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Échec de la récupération des demandes' });
  }
};

const getAvailableRequests = async (req, res) => {
  try {
    const { categorie, localisation } = req.query;
    const where = { statut: 'EN_ATTENTE' };
    if (categorie) where.categorie = { contains: categorie, mode: 'insensitive' };
    if (localisation) where.localisation = { contains: localisation, mode: 'insensitive' };

    const requests = await prisma.request.findMany({
      where,
      include: {
        particulier: { select: { id: true, nom: true, prenom: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Échec de la récupération des demandes disponibles' });
  }
};

const getRequestById = async (req, res) => {
  try {
    const request = await prisma.request.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        particulier: { select: { id: true, nom: true, prenom: true, avatar: true, telephone: true } },
        prestataire: { select: { id: true, nom: true, prenom: true, avatar: true, telephone: true } },
      },
    });
    if (!request) return res.status(404).json({ error: 'Demande introuvable' });
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Échec de la récupération de la demande' });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const prestataireId = req.user.id;

    const existing = await prisma.request.findUnique({ where: { id: parseInt(id) } });
    if (!existing) return res.status(404).json({ error: 'Demande introuvable' });
    if (existing.statut !== 'EN_ATTENTE') return res.status(400).json({ error: 'Cette demande n\'est plus disponible' });

    const request = await prisma.request.update({
      where: { id: parseInt(id) },
      data: { prestataireId, statut: 'ACCEPTEE' },
      include: { particulier: { select: { id: true, nom: true, prenom: true } } },
    });

    await prisma.notification.create({
      data: {
        message: `${req.user.nom || 'Un prestataire'} a accepté votre demande "${existing.titre}"`,
        type: 'SUCCESS',
        userId: existing.particulierId,
      },
    });

    res.json(request);
  } catch (error) {
    console.error('acceptRequest:', error);
    res.status(500).json({ error: 'Échec de l\'acceptation de la demande' });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    const validStatuts = ['EN_ATTENTE', 'ACCEPTEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'];
    if (!validStatuts.includes(statut)) return res.status(400).json({ error: 'Statut invalide' });

    const request = await prisma.request.update({
      where: { id: parseInt(id) },
      data: { statut },
    });
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Échec de la mise à jour du statut' });
  }
};

// Particulier assigne sa demande à un prestataire spécifique
const assignRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { prestataireId } = req.body;
    if (!prestataireId) return res.status(400).json({ error: 'prestataireId requis' });

    const request = await prisma.request.findUnique({ where: { id: parseInt(id) } });
    if (!request) return res.status(404).json({ error: 'Demande introuvable' });
    if (request.particulierId !== req.user.id) return res.status(403).json({ error: 'Non autorisé' });

    const updated = await prisma.request.update({
      where: { id: parseInt(id) },
      data: { prestataireId: parseInt(prestataireId), statut: 'ASSIGNEE' },
      include: {
        prestataire: { select: { id: true, nom: true, prenom: true, avatar: true } },
        particulier: { select: { id: true, nom: true, prenom: true } },
      }
    });

    // Notifier le prestataire
    await prisma.notification.create({
      data: {
        message: `${request.particulierId ? updated.particulier.prenom : 'Un client'} vous a assigné une demande : "${request.titre}"`,
        type: 'INFO',
        userId: parseInt(prestataireId),
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('assignRequest:', error);
    res.status(500).json({ error: 'Échec de l\'assignation' });
  }
};

module.exports = {
  createRequest,
  getCustomerRequests,
  getProviderRequests,
  getAvailableRequests,
  getRequestById,
  acceptRequest,
  updateRequestStatus,
  assignRequest,
};
