const prisma = require('../lib/prisma');

// Obtenir ou créer une conversation entre deux users (avec ou sans requête liée)
const getOrCreateConversation = async (req, res) => {
  try {
    const { otherUserId, requestId } = req.body;
    const myId = req.user.id;

    if (!otherUserId) return res.status(400).json({ error: 'otherUserId requis' });

    // Chercher une conv existante entre ces deux users sur cette demande
    let conversation = null;
    if (requestId) {
      conversation = await prisma.conversation.findUnique({
        where: { requestId: parseInt(requestId) },
        include: { participants: true, messages: { take: 1 } }
      });
    }

    if (!conversation) {
      // Chercher une conv directe entre les deux users
      conversation = await prisma.conversation.findFirst({
        where: {
          requestId: requestId ? parseInt(requestId) : null,
          participants: {
            every: { userId: { in: [myId, parseInt(otherUserId)] } }
          }
        },
        include: { participants: true }
      });
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          requestId: requestId ? parseInt(requestId) : null,
          participants: {
            create: [
              { userId: myId },
              { userId: parseInt(otherUserId) },
            ]
          }
        },
        include: { participants: true }
      });
    } else {
      // Ensure both participants exist
      const pIds = conversation.participants.map(p => p.userId);
      for (const uid of [myId, parseInt(otherUserId)]) {
        if (!pIds.includes(uid)) {
          await prisma.conversationParticipant.create({
            data: { conversationId: conversation.id, userId: uid }
          });
        }
      }
    }

    res.json(conversation);
  } catch (e) {
    console.error('getOrCreateConversation:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Lister les conversations de l'utilisateur
const getConversations = async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { userId: req.user.id } } },
      include: {
        request: { select: { id: true, titre: true } },
        participants: {
          include: { user: { select: { id: true, nom: true, prenom: true, avatar: true, role: true } } }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(conversations);
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Messages d'une conversation
const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const isParticipant = await prisma.conversationParticipant.findFirst({
      where: { conversationId: parseInt(id), userId: req.user.id }
    });
    if (!isParticipant) return res.status(403).json({ error: 'Accès refusé' });

    const messages = await prisma.message.findMany({
      where: { conversationId: parseInt(id) },
      include: { sender: { select: { id: true, nom: true, prenom: true, avatar: true } } },
      orderBy: { createdAt: 'asc' },
    });

    // Mark as read
    await prisma.message.updateMany({
      where: { conversationId: parseInt(id), senderId: { not: req.user.id }, read: false },
      data: { read: true }
    });

    res.json(messages);
  } catch (e) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = { getOrCreateConversation, getConversations, getMessages };
