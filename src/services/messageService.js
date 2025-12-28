const { User, Session, Message } = require('../models');
const logger = require('../utils/logger');

class MessageService {
  async getOrCreateUser(phoneNumber) {
    try {
      let user = await User.findOne({ where: { phoneNumber } });
      
      if (!user) {
        user = await User.create({
          phoneNumber,
          isActive: true,
          lastSeenAt: new Date()
        });
        logger.info(`New user created: ${phoneNumber}`);
      } else {
        await user.update({ lastSeenAt: new Date() });
      }
      
      return user;
    } catch (error) {
      logger.error('Error getting or creating user:', error);
      throw error;
    }
  }

  async getOrCreateSession(userId, sessionType = 'daily') {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let session;

      if (sessionType === 'daily') {
        // Find or create today's session
        session = await Session.findOne({
          where: {
            userId,
            type: 'daily',
            status: 'active',
            startedAt: {
              [require('sequelize').Op.gte]: today
            }
          }
        });

        if (!session) {
          session = await Session.create({
            userId,
            type: 'daily',
            status: 'active',
            title: `Session ${today.toISOString().split('T')[0]}`,
            startedAt: new Date()
          });
          logger.info(`New daily session created for user ${userId}`);
        }
      } else {
        // Get most recent active session or create new one
        session = await Session.findOne({
          where: {
            userId,
            status: 'active'
          },
          order: [['createdAt', 'DESC']]
        });

        if (!session) {
          session = await Session.create({
            userId,
            type: sessionType,
            status: 'active',
            title: `Session ${new Date().toISOString()}`,
            startedAt: new Date()
          });
          logger.info(`New session created for user ${userId}`);
        }
      }

      return session;
    } catch (error) {
      logger.error('Error getting or creating session:', error);
      throw error;
    }
  }

  async saveMessage(messageData) {
    try {
      const message = await Message.create(messageData);
      logger.info(`Message saved: ${message.id}`);
      return message;
    } catch (error) {
      logger.error('Error saving message:', error);
      throw error;
    }
  }

  async updateMessageStatus(messageId, status) {
    try {
      const message = await Message.findByPk(messageId);
      if (message) {
        await message.update({ status });
        logger.info(`Message ${messageId} status updated to ${status}`);
      }
    } catch (error) {
      logger.error('Error updating message status:', error);
      throw error;
    }
  }

  async getSessionHistory(userId, limit = 10) {
    try {
      const sessions = await Session.findAll({
        where: { userId },
        include: [
          {
            model: Message,
            as: 'messages',
            limit: 5,
            order: [['createdAt', 'DESC']]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit
      });
      
      return sessions;
    } catch (error) {
      logger.error('Error getting session history:', error);
      throw error;
    }
  }
}

module.exports = new MessageService();
