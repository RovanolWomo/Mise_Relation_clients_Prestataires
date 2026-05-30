const prisma = require('../lib/prisma');
const { uploadToCloudinary } = require('../utils/cloudinary');

const createService = async (req, res) => {
  try {
    const { titre, description, prix, categoryId, zone } = req.body;
    const prestataireId = req.user.id;

    let imageUrl = null;
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, { folder: 'relconnect/services' });
        imageUrl = result.secure_url;
      } catch (uploadErr) {
        console.warn('Image upload failed (non-blocking):', uploadErr.message);
      }
    }

    const service = await prisma.service.create({
      data: {
        titre,
        description,
        prix: parseFloat(prix),
        categoryId: parseInt(categoryId),
        prestataireId,
        image: imageUrl,
        zone,
      },
      include: {
        prestataire: { select: { id: true, nom: true, prenom: true, avatar: true } },
        category: true,
      },
    });

    res.status(201).json(service);
  } catch (error) {
    console.error('createService:', error);
    res.status(500).json({ error: 'Échec de la création du service' });
  }
};

const getServices = async (req, res) => {
  try {
    const { categoryId, categorie, prestataireId, disponible, search } = req.query;

    const where = {};
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (prestataireId) where.prestataireId = parseInt(prestataireId);
    if (disponible !== undefined) where.disponibilite = disponible === 'true';
    if (categorie) where.category = { nom: { contains: categorie, mode: 'insensitive' } };
    if (search) where.OR = [
      { titre: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];

    const services = await prisma.service.findMany({
      where,
      include: {
        prestataire: { select: { id: true, nom: true, prenom: true, avatar: true, verified: true, zone: true } },
        category: true,
        reviews: { select: { note: true } },
      },
      orderBy: { datePublication: 'desc' },
    });

    const enriched = services.map(s => ({
      ...s,
      avgNote: s.reviews.length ? s.reviews.reduce((a, r) => a + r.note, 0) / s.reviews.length : null,
      reviewCount: s.reviews.length,
    }));

    res.json(enriched);
  } catch (error) {
    console.error('getServices:', error);
    res.status(500).json({ error: 'Échec de la récupération des services' });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        prestataire: { select: { id: true, nom: true, prenom: true, avatar: true, bio: true, verified: true, zone: true, experience: true } },
        category: true,
        reviews: {
          include: { auteur: { select: { id: true, nom: true, prenom: true, avatar: true } } },
          orderBy: { dateAvis: 'desc' },
        },
      },
    });
    if (!service) return res.status(404).json({ error: 'Service introuvable' });

    const avgNote = service.reviews.length
      ? service.reviews.reduce((a, r) => a + r.note, 0) / service.reviews.length
      : null;

    res.json({ ...service, avgNote, reviewCount: service.reviews.length });
  } catch (error) {
    res.status(500).json({ error: 'Échec de la récupération du service' });
  }
};

const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await prisma.service.findUnique({ where: { id: parseInt(id) } });
    if (!service) return res.status(404).json({ error: 'Service introuvable' });
    if (service.prestataireId !== req.user.id) return res.status(403).json({ error: 'Non autorisé' });

    const data = { ...req.body };
    if (data.prix) data.prix = parseFloat(data.prix);
    if (data.categoryId) data.categoryId = parseInt(data.categoryId);

    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, { folder: 'relconnect/services' });
        data.image = result.secure_url;
      } catch (uploadErr) {
        console.warn('Image upload failed:', uploadErr.message);
      }
    }

    const updated = await prisma.service.update({ where: { id: parseInt(id) }, data });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Échec de la mise à jour du service' });
  }
};

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await prisma.service.findUnique({ where: { id: parseInt(id) } });
    if (!service) return res.status(404).json({ error: 'Service introuvable' });
    if (service.prestataireId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Non autorisé' });
    }
    await prisma.service.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Échec de la suppression du service' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { nom: 'asc' } });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Échec de la récupération des catégories' });
  }
};

const getMyServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { prestataireId: req.user.id },
      include: {
        category: true,
        reviews: { select: { note: true } },
      },
      orderBy: { datePublication: 'desc' },
    });
    const enriched = services.map(s => ({
      ...s,
      avgNote: s.reviews.length ? s.reviews.reduce((a, r) => a + r.note, 0) / s.reviews.length : null,
      reviewCount: s.reviews.length,
    }));
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: 'Échec de la récupération de vos services' });
  }
};

module.exports = { createService, getServices, getServiceById, updateService, deleteService, getCategories, getMyServices };
