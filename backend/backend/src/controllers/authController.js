const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { sendMail } = require('../utils/mailer');

const generateToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const safeUser = (user) => ({
  id: user.id,
  email: user.email,
  nom: user.nom,
  prenom: user.prenom,
  telephone: user.telephone,
  role: user.role,
  avatar: user.avatar,
  bio: user.bio,
  competences: user.competences,
  experience: user.experience,
  tarif: user.tarif,
  zone: user.zone,
  categorie: user.categorie,
  verified: user.verified,
  statut: user.statut,
  createdAt: user.createdAt,
});

const register = async (req, res) => {
  try {
    const { email, password, nom, prenom, telephone, role } = req.body;

    if (!email || !password || !nom || !prenom) {
      return res.status(400).json({ error: 'Champs obligatoires manquants (email, password, nom, prenom)' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Cet email est déjà utilisé' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, nom, prenom, telephone, role: role?.toUpperCase() || 'PARTICULIER' },
    });

    const token = generateToken(user);
    res.status(201).json({ user: safeUser(user), token });
  } catch (error) {
    console.error('register:', error);
    res.status(500).json({ error: 'Échec de l\'inscription' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Identifiants invalides' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Identifiants invalides' });

    const token = generateToken(user);
    res.json({ user: safeUser(user), token });
  } catch (error) {
    console.error('login:', error);
    res.status(500).json({ error: 'Échec de la connexion' });
  }
};

const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(safeUser(user));
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { nom, prenom, telephone, bio, competences, experience, tarif, zone, categorie } = req.body;

    const data = {};
    if (nom !== undefined) data.nom = nom;
    if (prenom !== undefined) data.prenom = prenom;
    if (telephone !== undefined) data.telephone = telephone;
    if (bio !== undefined) data.bio = bio;
    if (competences !== undefined) data.competences = competences;
    if (experience !== undefined) data.experience = experience;
    if (tarif !== undefined) data.tarif = parseFloat(tarif);
    if (zone !== undefined) data.zone = zone;
    if (categorie !== undefined) data.categorie = categorie;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: 'relconnect/avatars',
        public_id: `avatar_${req.user.id}`,
        overwrite: true,
      });
      data.avatar = result.secure_url;
    }

    const user = await prisma.user.update({ where: { id: req.user.id }, data });
    res.json(safeUser(user));
  } catch (error) {
    console.error('updateProfile:', error);
    res.status(500).json({ error: 'Échec de la mise à jour du profil' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel et nouveau requis' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ error: 'Mot de passe actuel incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ message: 'Mot de passe mis à jour' });
  } catch (error) {
    res.status(500).json({ error: 'Échec du changement de mot de passe' });
  }
};

const registerPrestataire = async (req, res) => {
  try {
    const { email, password, nom, prenom, telephone, categorie, experience, bio, tarif, zone } = req.body;

    if (!email || !password || !nom || !prenom) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Cet email est déjà utilisé' });

    let avatarUrl = null;
    const photoFile = req.files?.photoProfil?.[0];
    if (photoFile) {
      try {
        const result = await uploadToCloudinary(photoFile.buffer, {
          folder: 'relconnect/kyc',
          resource_type: 'image',
        });
        avatarUrl = result.secure_url;
      } catch (uploadErr) {
        console.warn('Avatar upload failed (non-blocking):', uploadErr.message);
      }
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        nom,
        prenom,
        telephone,
        role: 'PRESTATAIRE',
        avatar: avatarUrl,
        bio,
        competences: categorie,
        categorie,
        experience,
        tarif: tarif ? parseFloat(tarif) : null,
        zone,
        verified: false,
        statut: 'EN_ATTENTE_VERIFICATION',
      },
    });

    // Sauvegarder les documents KYC
    const docFields = ['photoProfil', 'cniRecto', 'cniVerso', 'justif', 'diplome', 'attestation'];
    for (const field of docFields) {
      const file = req.files?.[field]?.[0];
      if (file) {
        try {
          const result = await uploadToCloudinary(file.buffer, {
            folder: 'relconnect/kyc',
            resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'image',
          });
          await prisma.kycDocument.create({
            data: {
              type: field,
              url: result.secure_url,
              publicId: result.public_id,
              mimeType: file.mimetype,
              userId: user.id,
            },
          });
        } catch (uploadErr) {
          console.warn(`KYC doc ${field} upload failed:`, uploadErr.message);
        }
      }
    }

    // Email de confirmation
    await sendMail({
      to: user.email,
      subject: 'Bienvenue sur Prestolink — Dossier reçu',
      html: `<h2>Bonjour ${user.prenom} !</h2><p>Votre dossier prestataire a bien été reçu. Notre équipe va l'examiner dans les plus brefs délais.</p><p>Vous recevrez un email dès que votre compte sera approuvé.</p><p>— L'équipe Prestolink</p>`,
    });

    const token = generateToken(user);
    res.status(201).json({ user: safeUser(user), token });
  } catch (error) {
    console.error('registerPrestataire:', error);
    res.status(500).json({ error: 'Échec de l\'inscription prestataire' });
  }
};

module.exports = { register, login, me, updateProfile, changePassword, registerPrestataire };
