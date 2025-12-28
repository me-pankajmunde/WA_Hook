const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const { Media } = require('../models');
const whatsappService = require('./whatsappService');
const config = require('../config');
const logger = require('../utils/logger');

class MediaService {
  constructor() {
    this.uploadDir = config.storage.localPath;
    this.ensureUploadDir();
  }

  async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      logger.error('Error creating upload directory:', error);
    }
  }

  async downloadAndSave(mediaId, messageId, userId, sessionId, mediaType) {
    try {
      // Download media from WhatsApp
      const mediaData = await whatsappService.downloadMedia(mediaId);
      
      // Generate filename
      const extension = this.getExtensionFromMimeType(mediaData.mimeType);
      const filename = `${uuidv4()}.${extension}`;
      const filePath = path.join(this.uploadDir, filename);
      
      // Save file
      await fs.writeFile(filePath, mediaData.data);
      logger.info(`Media saved: ${filename}`);

      // Create database record
      const media = await Media.create({
        messageId,
        userId,
        sessionId,
        type: mediaType,
        storedPath: filePath,
        filename,
        mimeType: mediaData.mimeType,
        size: mediaData.size,
        isProcessed: false
      });

      // Process image if it's an image type
      if (mediaType === 'image') {
        await this.processImage(media.id, filePath);
      }

      return media;
    } catch (error) {
      logger.error('Error downloading and saving media:', error);
      throw error;
    }
  }

  async processImage(mediaId, filePath) {
    try {
      // Create thumbnail
      const thumbnailPath = filePath.replace(/(\.[^.]+)$/, '_thumb$1');
      await sharp(filePath)
        .resize(300, 300, { fit: 'inside' })
        .toFile(thumbnailPath);
      
      // Update media record
      await Media.update(
        { 
          metadata: { thumbnailPath },
          isProcessed: true
        },
        { where: { id: mediaId } }
      );

      logger.info(`Image processed: ${mediaId}`);
    } catch (error) {
      logger.error('Error processing image:', error);
    }
  }

  getExtensionFromMimeType(mimeType) {
    const mimeMap = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'video/mp4': 'mp4',
      'video/3gpp': '3gp',
      'audio/aac': 'aac',
      'audio/mp4': 'm4a',
      'audio/mpeg': 'mp3',
      'audio/amr': 'amr',
      'audio/ogg': 'ogg',
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
    };

    return mimeMap[mimeType] || 'bin';
  }

  async getMediaById(mediaId) {
    try {
      return await Media.findByPk(mediaId);
    } catch (error) {
      logger.error('Error getting media:', error);
      throw error;
    }
  }

  async getMediaFile(mediaId) {
    try {
      const media = await this.getMediaById(mediaId);
      if (!media) {
        throw new Error('Media not found');
      }

      const fileData = await fs.readFile(media.storedPath);
      return {
        data: fileData,
        mimeType: media.mimeType,
        filename: media.filename
      };
    } catch (error) {
      logger.error('Error getting media file:', error);
      throw error;
    }
  }
}

module.exports = new MediaService();
