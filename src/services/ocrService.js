const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');
const { Media } = require('../models');

class OCRService {
  constructor() {
    // Using free OCR.space API as example
    this.apiKey = config.ocr.apiKey;
    this.apiUrl = 'https://api.ocr.space/parse/image';
  }

  async extractTextFromImage(imagePath) {
    try {
      const FormData = require('form-data');
      const fs = require('fs');
      
      const formData = new FormData();
      formData.append('file', fs.createReadStream(imagePath));
      formData.append('apikey', this.apiKey);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');
      formData.append('detectOrientation', 'true');

      const response = await axios.post(this.apiUrl, formData, {
        headers: formData.getHeaders()
      });

      if (response.data && response.data.ParsedResults) {
        const extractedText = response.data.ParsedResults
          .map(result => result.ParsedText)
          .join('\n');
        
        logger.info('OCR extraction successful', { 
          textLength: extractedText.length 
        });

        return {
          text: extractedText,
          confidence: response.data.ParsedResults[0]?.TextOrientation || 0
        };
      }

      return { text: '', confidence: 0 };
    } catch (error) {
      logger.error('OCR extraction error:', error);
      // Fallback to AI-based text extraction
      return this.fallbackToAI(imagePath);
    }
  }

  async fallbackToAI(imagePath) {
    try {
      const aiService = require('./aiService');
      const fs = require('fs');
      
      // Convert image to base64
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
      
      const extractedText = await aiService.analyzeImage(
        base64Image,
        'Extract all text from this image. If there is no text, describe what you see.'
      );

      logger.info('AI-based text extraction successful');
      return { text: extractedText, confidence: 0.8 };
    } catch (error) {
      logger.error('AI text extraction error:', error);
      return { text: '', confidence: 0 };
    }
  }

  async classifyImage(imagePath) {
    try {
      const aiService = require('./aiService');
      const fs = require('fs');
      
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
      
      const classification = await aiService.analyzeImage(
        base64Image,
        `Classify this image into one of these categories: error_screenshot, code_snippet, 
        ui_design, diagram, note, document, other. 
        Return only the category name.`
      );

      logger.info('Image classified', { classification });
      return classification.trim().toLowerCase();
    } catch (error) {
      logger.error('Image classification error:', error);
      return 'other';
    }
  }

  async processMedia(mediaId) {
    try {
      const media = await Media.findByPk(mediaId);
      if (!media || media.type !== 'image') {
        return;
      }

      // Extract text
      const { text, confidence } = await this.extractTextFromImage(media.storedPath);
      
      // Classify image
      const classification = await this.classifyImage(media.storedPath);

      // Update media record
      await media.update({
        extractedText: text,
        classification,
        metadata: {
          ...media.metadata,
          ocrConfidence: confidence,
          processedAt: new Date()
        },
        isProcessed: true
      });

      logger.info(`Media processed: ${mediaId}`, { classification });
    } catch (error) {
      logger.error('Error processing media:', error);
      throw error;
    }
  }
}

module.exports = new OCRService();
