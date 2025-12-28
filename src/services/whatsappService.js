const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

class WhatsAppService {
  constructor() {
    this.apiUrl = `${config.whatsapp.apiUrl}/${config.whatsapp.apiVersion}`;
    this.phoneNumberId = config.whatsapp.phoneNumberId;
    this.token = config.whatsapp.token;
  }

  async sendMessage(to, message) {
    try {
      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;
      const response = await axios.post(url, {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message }
      }, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      logger.info(`Message sent to ${to}`, { messageId: response.data.messages[0].id });
      return response.data;
    } catch (error) {
      logger.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  async sendMediaMessage(to, mediaType, mediaId, caption = '') {
    try {
      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;
      const payload = {
        messaging_product: 'whatsapp',
        to,
        type: mediaType
      };

      payload[mediaType] = {
        id: mediaId
      };

      if (caption && ['image', 'video', 'document'].includes(mediaType)) {
        payload[mediaType].caption = caption;
      }

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      logger.info(`${mediaType} message sent to ${to}`, { messageId: response.data.messages[0].id });
      return response.data;
    } catch (error) {
      logger.error(`Error sending ${mediaType} message:`, error);
      throw error;
    }
  }

  async downloadMedia(mediaId) {
    try {
      // Get media URL
      const mediaUrl = `${this.apiUrl}/${mediaId}`;
      const response = await axios.get(mediaUrl, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      const downloadUrl = response.data.url;
      
      // Download media
      const mediaResponse = await axios.get(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        responseType: 'arraybuffer'
      });

      return {
        data: mediaResponse.data,
        mimeType: mediaResponse.headers['content-type'],
        size: mediaResponse.headers['content-length']
      };
    } catch (error) {
      logger.error('Error downloading media:', error);
      throw error;
    }
  }

  async markAsRead(messageId) {
    try {
      const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;
      await axios.post(url, {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      }, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      logger.info(`Message marked as read: ${messageId}`);
    } catch (error) {
      logger.error('Error marking message as read:', error);
      throw error;
    }
  }

  verifyWebhook(mode, token, challenge) {
    if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
      logger.info('Webhook verified successfully');
      return challenge;
    }
    logger.warn('Webhook verification failed');
    return null;
  }
}

module.exports = new WhatsAppService();
