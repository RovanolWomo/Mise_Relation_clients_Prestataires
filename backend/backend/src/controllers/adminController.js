const prisma = require('../lib/prisma');

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
        avatar: true, createdAt: true,
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

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Action invalide (approve ou reject)' });
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        verified: action === 'approve',
        statut: action === 'approve' ? 'ACTIF' : 'REJETE',
      },
    });

    await prisma.notification.create({
      data: {
        message: action === 'approve'
          ? 'Votre compte prestataire a été approuvé ! Vous pouvez maintenant publier vos prestations.'
          : 'Votre dossier KYC n\'a pas pu être validé. Contactez le support pour plus d\'informations.',
        type: action === 'approve' ? 'SUCCESS' : 'ERROR',
        userId: parseInt(id),
      },
    });

    res.json({ message: action === 'approve' ? 'Prestataire approuvé' : 'Prestataire rejeté', user });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
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

module.exports = { getStats, getUsers, getPendingKyc, verifyPrestataire, updateUserStatus, getAllRequests };
