const prisma = require('../lib/prisma');

const createReview = async (req, res) => {
  try {
    const { prestataireId, note, commentaire, serviceId } = req.body;

    if (!prestataireId || !note) {
      return res.status(400).json({ error: 'prestataireId et note sont obligatoires' });
    }
    if (note < 1 || note > 5) {
      return res.status(400).json({ error: 'La note doit être entre 1 et 5' });
    }

    const existing = await prisma.review.findFirst({
      where: { auteurId: req.user.id, prestataireId: parseInt(prestataireId), serviceId: serviceId ? parseInt(serviceId) : null },
    });
    if (existing) return res.status(400).json({ error: 'Vous avez déjà noté ce prestataire pour ce service' });

    const review = await prisma.review.create({
      data: {
        note: parseInt(note),
        commentaire,
        auteurId: req.user.id,
        prestataireId: parseInt(prestataireId),
        serviceId: serviceId ? parseInt(serviceId) : null,
      },
      include: { auteur: { select: { id: true, nom: true, prenom: true, avatar: true } } },
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('createReview:', error);
    res.status(500).json({ error: 'Échec de la création de l\'avis' });
  }
};

const getReviewsByPrestataire = async (req, res) => {
  try {
    const { id } = req.params;
    const reviews = await prisma.review.findMany({
      where: { prestataireId: parseInt(id) },
      include: { auteur: { select: { id: true, nom: true, prenom: true, avatar: true } } },
      orderBy: { dateAvis: 'desc' },
    });

    const avg = reviews.length ? reviews.reduce((a, r) => a + r.note, 0) / reviews.length : 0;
    res.json({ reviews, avgNote: avg, count: reviews.length });
  } catch (error) {
    res.status(500).json({ error: 'Échec de la récupération des avis' });
  }
};

module.exports = { createReview, getReviewsByPrestataire };
