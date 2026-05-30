const prisma = require('../lib/prisma');

const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Échec de la récupération des notifications' });
  }
};

const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await prisma.notification.findUnique({ where: { id: parseInt(id) } });
    if (!notif || notif.userId !== req.user.id) return res.status(404).json({ error: 'Notification introuvable' });

    await prisma.notification.update({ where: { id: parseInt(id) }, data: { lu: true } });
    res.json({ message: 'Notification marquée comme lue' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const markAllRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, lu: false },
      data: { lu: true },
    });
    res.json({ message: 'Toutes les notifications marquées comme lues' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await prisma.notification.findUnique({ where: { id: parseInt(id) } });
    if (!notif || notif.userId !== req.user.id) return res.status(404).json({ error: 'Notification introuvable' });

    await prisma.notification.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = { getNotifications, markRead, markAllRead, deleteNotification };
