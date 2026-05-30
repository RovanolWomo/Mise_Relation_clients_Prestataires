const prisma = require('../lib/prisma');

const getPrestataires = async (req, res) => {
  try {
    const { categorie, zone, search, verified } = req.query;

    const where = { role: 'PRESTATAIRE' };
    if (verified !== undefined) where.verified = verified === 'true';
    if (categorie) where.categorie = { contains: categorie, mode: 'insensitive' };
    if (zone) where.zone = { contains: zone, mode: 'insensitive' };
    if (search) where.OR = [
      { nom: { contains: search, mode: 'insensitive' } },
      { prenom: { contains: search, mode: 'insensitive' } },
      { bio: { contains: search, mode: 'insensitive' } },
      { categorie: { contains: search, mode: 'insensitive' } },
    ];

    const prestataires = await prisma.user.findMany({
      where,
      select: {
        id: true, nom: true, prenom: true, avatar: true, bio: true,
        categorie: true, experience: true, tarif: true, zone: true,
        verified: true, statut: true, createdAt: true,
        receivedReviews: { select: { note: true } },
        prestations: { where: { disponibilite: true }, select: { id: true }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = prestataires.map(p => ({
      ...p,
      avgNote: p.receivedReviews.length
        ? p.receivedReviews.reduce((a, r) => a + r.note, 0) / p.receivedReviews.length
        : null,
      reviewCount: p.receivedReviews.length,
      hasActiveService: p.prestations.length > 0,
      receivedReviews: undefined,
      prestations: undefined,
    }));

    res.json(enriched);
  } catch (error) {
    console.error('getPrestataires:', error);
    res.status(500).json({ error: 'Échec de la récupération des prestataires' });
  }
};

const getPrestataire = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findFirst({
      where: { id: parseInt(id), role: 'PRESTATAIRE' },
      select: {
        id: true, nom: true, prenom: true, avatar: true, bio: true,
        categorie: true, experience: true, tarif: true, zone: true,
        verified: true, createdAt: true,
        prestations: {
          where: { disponibilite: true },
          include: { category: true },
          orderBy: { datePublication: 'desc' },
        },
        receivedReviews: {
          include: { auteur: { select: { id: true, nom: true, prenom: true, avatar: true } } },
          orderBy: { dateAvis: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) return res.status(404).json({ error: 'Prestataire introuvable' });

    const avgNote = user.receivedReviews.length
      ? user.receivedReviews.reduce((a, r) => a + r.note, 0) / user.receivedReviews.length
      : null;

    res.json({ ...user, avgNote, reviewCount: user.receivedReviews.length });
  } catch (error) {
    res.status(500).json({ error: 'Échec de la récupération du profil' });
  }
};

module.exports = { getPrestataires, getPrestataire };
