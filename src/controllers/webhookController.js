const whatsappService = require('../services/whatsappService');
const messageService = require('../services/messageService');
const mediaService = require('../services/mediaService');
const aiService = require('../services/aiService');
const logger = require('../utils/logger');

class WebhookController {
  async verify(req, res) {
    try {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      const result = whatsappService.verifyWebhook(mode, token, challenge);
      
      if (result) {
        return res.status(200).send(challenge);
      }
      
      return res.status(403).json({ error: 'Verification failed' });
    } catch (error) {
      logger.error('Webhook verification error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async handleMessage(req, res) {
    try {
      const body = req.body;
      
      // Log incoming webhook
      logger.info('Webhook received', { body: JSON.stringify(body) });

      // Quick response to WhatsApp
      res.status(200).send('EVENT_RECEIVED');

      // Process webhook asynchronously
      if (body.object === 'whatsapp_business_account') {
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            if (change.field === 'messages') {
              await this.processMessages(change.value);
            }
          }
        }
      }
    } catch (error) {
      logger.error('Webhook handling error:', error);
      // Still return 200 to prevent WhatsApp from retrying
      if (!res.headersSent) {
        res.status(200).send('ERROR');
      }
    }
  }

  async processMessages(value) {
    try {
      if (!value.messages || value.messages.length === 0) {
        return;
      }

      const message = value.messages[0];
      const fromNumber = message.from;
      const whatsappMessageId = message.id;

      // Get or create user
      const user = await messageService.getOrCreateUser(fromNumber);
      
      // Get or create session
      const session = await messageService.getOrCreateSession(user.id);

      // Process different message types
      let content = '';
      let mediaId = null;
      let messageType = 'text';

      if (message.type === 'text') {
        content = message.text.body;
        messageType = 'text';
      } else if (message.type === 'image') {
        mediaId = message.image.id;
        content = message.image.caption || '';
        messageType = 'image';
      } else if (message.type === 'document') {
        mediaId = message.document.id;
        content = message.document.filename || '';
        messageType = 'document';
      } else if (message.type === 'audio') {
        mediaId = message.audio.id;
        messageType = 'audio';
      } else if (message.type === 'video') {
        mediaId = message.video.id;
        content = message.video.caption || '';
        messageType = 'video';
      }

      // Save incoming message
      const savedMessage = await messageService.saveMessage({
        sessionId: session.id,
        userId: user.id,
        whatsappMessageId,
        direction: 'inbound',
        type: messageType,
        content,
        status: 'delivered'
      });

      // Download and save media if present
      if (mediaId) {
        await mediaService.downloadAndSave(
          mediaId, 
          savedMessage.id, 
          user.id, 
          session.id, 
          messageType
        );
      }

      // Mark message as read
      await whatsappService.markAsRead(whatsappMessageId);

      // Generate AI response
      await this.generateAndSendResponse(user, session, savedMessage, content);

    } catch (error) {
      logger.error('Error processing messages:', error);
    }
  }

  async generateAndSendResponse(user, session, incomingMessage, userMessage) {
    try {
      // Get conversation history
      const { Message } = require('../models');
      const recentMessages = await Message.findAll({
        where: { 
          sessionId: session.id,
          isProcessed: true
        },
        order: [['createdAt', 'DESC']],
        limit: 10
      });

      // Build context
      const context = aiService.buildConversationContext(recentMessages.reverse());
      
      // Add current message
      context.push({
        role: 'user',
        content: userMessage || 'I sent you a media file.'
      });

      // Generate response
      const systemPrompt = `You are a helpful AI assistant integrated with WhatsApp. 
You help users with various tasks including:
- Answering questions
- Analyzing screenshots and images
- Helping with coding tasks
- Providing summaries and insights
- Assisting with productivity

Be concise and friendly. Keep responses short and to the point for WhatsApp.`;

      const aiResponse = await aiService.generateResponse(context, systemPrompt);

      // Save AI response
      const responseMessage = await messageService.saveMessage({
        sessionId: session.id,
        userId: user.id,
        direction: 'outbound',
        type: 'text',
        content: aiResponse.content,
        status: 'pending'
      });

      // Send response via WhatsApp
      await whatsappService.sendMessage(user.phoneNumber, aiResponse.content);
      
      // Update message status
      await messageService.updateMessageStatus(responseMessage.id, 'sent');
      
      // Mark messages as processed
      await incomingMessage.update({ isProcessed: true });

      logger.info(`Response sent to user ${user.phoneNumber}`);
    } catch (error) {
      logger.error('Error generating response:', error);
      
      // Send error message
      try {
        await whatsappService.sendMessage(
          user.phoneNumber,
          'Sorry, I encountered an error processing your message. Please try again.'
        );
      } catch (sendError) {
        logger.error('Error sending error message:', sendError);
      }
    }
  }
}

module.exports = new WebhookController();
