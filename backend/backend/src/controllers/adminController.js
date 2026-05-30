const prisma = require('../lib/prisma');
const { sendMail } = require('../utils/mailer');

const getStats = async (req, res) => {
  try {
    const [totalUsers, totalPrestataires, totalRequests, totalServices, pendingKyc, activeRequests] =
      await Promise.all([
        prisma.user.count({ where: { role: { in: ['PARTICULIER', 'PRESTATAIRE'] } } }),
        prisma.user.count({ where: { role: 'PRESTATAIRE', verified: true } }),
        prisma.request.count(),
        prisma.service.count(),
        prisma.user.count({ where: { role: 'PRESTATAIRE', verified: false, statut: 'EN_ATTENTE_VERIFICATION' } }),
        prisma.request.count({ where: { statut: { in: ['EN_ATTENTE', 'ACCEPTEE', 'EN_COURS'] } } }),
      ]);

    res.json({ totalUsers, totalPrestataires, totalRequests, totalServices, pendingKyc, activeRequests });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};

const getUsers = async (req, res) => {
  try {
    const { role, statut, page = 1, limit = 20 } = req.query;
    const where = {};
    if (role) where.role = role.toUpperCase();
    if (statut) where.statut = statut.toUpperCase();

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, nom: true, prenom: true, email: true, telephone: true,
          role: true, statut: true, verified: true, categorie: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ users, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
};

const getPendingKyc = async (req, res) => {
  try {
    const prestataires = await prisma.user.findMany({
      where: { role: 'PRESTATAIRE', verified: false, statut: 'EN_ATTENTE_VERIFICATION' },
      select: {
        id: true, nom: true, prenom: true, email: true, telephone: true,
        categorie: true, experience: true, bio: true, zone: true, tarif: true,
        avatar: true, createdAt: true, statut: true, verified: true,
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(prestataires);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const verifyPrestataire = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    if (!['approve', 'reject'].includes(action)) return res.status(400).json({ error: 'Action invalide' });
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { verified: action === 'approve', statut: action === 'approve' ? 'ACTIF' : 'REJETE' }
    });
    const msg = action === 'approve'
      ? 'Votre compte prestataire a été approuvé ! Vous pouvez maintenant publier vos prestations.'
      : "Votre dossier KYC n'a pas pu être validé. Contactez le support.";
    await prisma.notification.create({ data: { message: msg, type: action === 'approve' ? 'SUCCESS' : 'ERROR', userId: parseInt(id) } });
    await sendMail({
      to: user.email,
      subject: action === 'approve' ? '✅ Votre compte Prestolink est approuvé !' : '❌ Votre dossier KYC',
      html: `<h2>${action === 'approve' ? 'Bienvenue sur Prestolink !' : 'Dossier non validé'}</h2><p>${msg}</p>`
    });
    res.json({ message: action === 'approve' ? 'Approuvé' : 'Rejeté', user });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;
    const user = await prisma.user.update({ where: { id: parseInt(id) }, data: { statut } });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const getAllRequests = async (req, res) => {
  try {
    const { statut, page = 1, limit = 20 } = req.query;
    const where = statut ? { statut: statut.toUpperCase() } : {};

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        include: {
          particulier: { select: { id: true, nom: true, prenom: true, email: true } },
          prestataire: { select: { id: true, nom: true, prenom: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.request.count({ where }),
    ]);

    res.json({ requests, total });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET /api/admin/kyc/:id - détail KYC avec documents
const getKycDetail = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true, nom: true, prenom: true, email: true, telephone: true,
        categorie: true, experience: true, bio: true, zone: true, tarif: true,
        avatar: true, statut: true, verified: true, createdAt: true,
        kycDocuments: true,
      },
    });
    if (!user) return res.status(404).json({ error: 'Introuvable' });
    res.json(user);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

// POST /api/admin/users/register - inscription manuelle
const adminRegisterUser = async (req, res) => {
  const bcrypt = require('bcryptjs');
  try {
    const { email, password, nom, prenom, telephone, role, categorie, experience, bio, tarif, zone } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email déjà utilisé' });
    const hashed = await bcrypt.hash(password || 'PrestoDefault@2026', 10);
    const user = await prisma.user.create({
      data: {
        email, password: hashed, nom, prenom, telephone,
        role: role?.toUpperCase() || 'PARTICULIER',
        categorie, experience, bio,
        tarif: tarif ? parseFloat(tarif) : null,
        zone,
        verified: role?.toUpperCase() === 'PRESTATAIRE' ? false : true,
        statut: role?.toUpperCase() === 'PRESTATAIRE' ? 'EN_ATTENTE_VERIFICATION' : 'ACTIF',
      }
    });
    res.status(201).json(user);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
};

// GET /api/admin/categories
const adminGetCategories = async (req, res) => {
  try {
    const cats = await prisma.category.findMany({
      include: { _count: { select: { services: true } } },
      orderBy: { nom: 'asc' }
    });
    res.json(cats);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

// POST /api/admin/categories
const adminCreateCategory = async (req, res) => {
  try {
    const { nom, description, icone } = req.body;
    if (!nom) return res.status(400).json({ error: 'Nom requis' });
    const cat = await prisma.category.create({ data: { nom, description, icone } });
    res.status(201).json(cat);
  } catch (e) {
    if (e.code === 'P2002') return res.status(400).json({ error: 'Catégorie déjà existante' });
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// PUT /api/admin/categories/:id
const adminUpdateCategory = async (req, res) => {
  try {
    const cat = await prisma.category.update({ where: { id: parseInt(req.params.id) }, data: req.body });
    res.json(cat);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

// DELETE /api/admin/categories/:id
const adminDeleteCategory = async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

// GET /api/admin/services - liste complète avec filtres
const adminGetServices = async (req, res) => {
  try {
    const { search, categoryId, disponible, featured } = req.query;
    const where = {};
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (disponible !== undefined) where.disponibilite = disponible === 'true';
    if (featured !== undefined) where.featured = featured === 'true';
    if (search) where.OR = [
      { titre: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];

    const services = await prisma.service.findMany({
      where,
      include: {
        prestataire: { select: { id: true, nom: true, prenom: true, email: true } },
        category: true,
        _count: { select: { reviews: true } },
      },
      orderBy: [{ featured: 'desc' }, { datePublication: 'desc' }],
    });
    res.json(services);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

// POST /api/admin/services - créer un service (pour un prestataire donné)
const adminCreateService = async (req, res) => {
  try {
    const { titre, description, prix, categoryId, prestataireId, zone, disponibilite } = req.body;
    if (!titre || !description || !prix || !categoryId || !prestataireId) {
      return res.status(400).json({ error: 'Champs obligatoires : titre, description, prix, categoryId, prestataireId' });
    }
    const service = await prisma.service.create({
      data: {
        titre,
        description,
        prix: parseFloat(prix),
        categoryId: parseInt(categoryId),
        prestataireId: parseInt(prestataireId),
        zone: zone || null,
        disponibilite: disponibilite !== undefined ? (disponibilite === true || disponibilite === 'true') : true,
      },
      include: {
        prestataire: { select: { id: true, nom: true, prenom: true } },
        category: true,
      },
    });
    res.status(201).json(service);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Erreur serveur' }); }
};

// PUT /api/admin/services/:id - modifier n'importe quel service
const adminUpdateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, description, prix, categoryId, zone, disponibilite, featured } = req.body;
    const data = {};
    if (titre !== undefined) data.titre = titre;
    if (description !== undefined) data.description = description;
    if (prix !== undefined) data.prix = parseFloat(prix);
    if (categoryId !== undefined) data.categoryId = parseInt(categoryId);
    if (zone !== undefined) data.zone = zone;
    if (disponibilite !== undefined) data.disponibilite = disponibilite === true || disponibilite === 'true';
    if (featured !== undefined) data.featured = featured === true || featured === 'true';

    const service = await prisma.service.update({
      where: { id: parseInt(id) },
      data,
      include: {
        prestataire: { select: { id: true, nom: true, prenom: true } },
        category: true,
      },
    });
    res.json(service);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

// DELETE /api/admin/services/:id
const adminDeleteService = async (req, res) => {
  try {
    await prisma.service.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

// GET /api/admin/services/featured - alias pour compatibilité
const getFeaturedServices = async (req, res) => {
  req.query.featured = 'true';
  return adminGetServices(req, res);
};

// PATCH /api/admin/services/:id/featured
const toggleFeaturedService = async (req, res) => {
  try {
    const { featured } = req.body;
    const service = await prisma.service.update({ where: { id: parseInt(req.params.id) }, data: { featured } });
    res.json(service);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

// GET /api/admin/payment-config
const getPaymentConfig = async (req, res) => {
  try {
    const configs = await prisma.paymentConfig.findMany();
    res.json(configs);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

// PUT /api/admin/payment-config/:provider
const upsertPaymentConfig = async (req, res) => {
  try {
    const { provider } = req.params;
    const data = req.body;
    const config = await prisma.paymentConfig.upsert({
      where: { provider },
      update: data,
      create: { provider, ...data }
    });
    res.json(config);
  } catch (e) { res.status(500).json({ error: 'Erreur serveur' }); }
};

module.exports = {
  getStats, getUsers, getPendingKyc, verifyPrestataire, updateUserStatus, getAllRequests,
  getKycDetail, adminRegisterUser, adminGetCategories, adminCreateCategory, adminUpdateCategory,
  adminDeleteCategory, adminGetServices, adminCreateService, adminUpdateService, adminDeleteService,
  getFeaturedServices, toggleFeaturedService, getPaymentConfig, upsertPaymentConfig,
};
