const { Session, Message, Media, Artifact } = require('../models');
const messageService = require('../services/messageService');
const logger = require('../utils/logger');

class SessionController {
  async getSessions(req, res) {
    try {
      const userId = req.user.id;
      const { limit = 10, offset = 0, status } = req.query;

      const where = { userId };
      if (status) {
        where.status = status;
      }

      const sessions = await Session.findAndCountAll({
        where,
        include: [
          {
            model: Message,
            as: 'messages',
            limit: 5,
            order: [['createdAt', 'DESC']],
            separate: true
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        total: sessions.count,
        sessions: sessions.rows
      });
    } catch (error) {
      logger.error('Get sessions error:', error);
      res.status(500).json({ error: 'Failed to get sessions' });
    }
  }

  async getSession(req, res) {
    try {
      const userId = req.user.id;
      const { sessionId } = req.params;

      const session = await Session.findOne({
        where: { id: sessionId, userId },
        include: [
          {
            model: Message,
            as: 'messages',
            order: [['createdAt', 'ASC']],
            include: [
              {
                model: Media,
                as: 'media'
              }
            ]
          },
          {
            model: Artifact,
            as: 'artifacts'
          }
        ]
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json(session);
    } catch (error) {
      logger.error('Get session error:', error);
      res.status(500).json({ error: 'Failed to get session' });
    }
  }

  async createSession(req, res) {
    try {
      const userId = req.user.id;
      const { title, description, type = 'task' } = req.body;

      const session = await Session.create({
        userId,
        title: title || `Session ${new Date().toISOString()}`,
        description,
        type,
        status: 'active',
        startedAt: new Date()
      });

      logger.info(`Session created: ${session.id}`);

      res.status(201).json(session);
    } catch (error) {
      logger.error('Create session error:', error);
      res.status(500).json({ error: 'Failed to create session' });
    }
  }

  async updateSession(req, res) {
    try {
      const userId = req.user.id;
      const { sessionId } = req.params;
      const { title, description, status } = req.body;

      const session = await Session.findOne({
        where: { id: sessionId, userId }
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      await session.update({
        ...(title && { title }),
        ...(description && { description }),
        ...(status && { status }),
        ...(status === 'completed' && { completedAt: new Date() })
      });

      logger.info(`Session updated: ${session.id}`);

      res.json(session);
    } catch (error) {
      logger.error('Update session error:', error);
      res.status(500).json({ error: 'Failed to update session' });
    }
  }

  async deleteSession(req, res) {
    try {
      const userId = req.user.id;
      const { sessionId } = req.params;

      const session = await Session.findOne({
        where: { id: sessionId, userId }
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      await session.update({ status: 'archived' });

      logger.info(`Session archived: ${session.id}`);

      res.json({ message: 'Session archived successfully' });
    } catch (error) {
      logger.error('Delete session error:', error);
      res.status(500).json({ error: 'Failed to delete session' });
    }
  }

  async getSessionStats(req, res) {
    try {
      const userId = req.user.id;
      const { sessionId } = req.params;

      const session = await Session.findOne({
        where: { id: sessionId, userId }
      });

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const [messageCount, mediaCount, artifactCount] = await Promise.all([
        Message.count({ where: { sessionId } }),
        Media.count({ where: { sessionId } }),
        Artifact.count({ where: { sessionId } })
      ]);

      res.json({
        sessionId,
        stats: {
          messages: messageCount,
          media: mediaCount,
          artifacts: artifactCount,
          duration: session.completedAt 
            ? new Date(session.completedAt) - new Date(session.startedAt)
            : new Date() - new Date(session.startedAt)
        }
      });
    } catch (error) {
      logger.error('Get session stats error:', error);
      res.status(500).json({ error: 'Failed to get session stats' });
    }
  }
}

module.exports = new SessionController();
