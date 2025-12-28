const OpenAI = require('openai');
const config = require('../config');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.ai.openai.apiKey
    });
  }

  async generateResponse(messages, systemPrompt = null) {
    try {
      const messagesPayload = systemPrompt 
        ? [{ role: 'system', content: systemPrompt }, ...messages]
        : messages;

      const response = await this.openai.chat.completions.create({
        model: config.ai.openai.model,
        messages: messagesPayload,
        temperature: config.ai.openai.temperature,
        max_tokens: config.ai.openai.maxTokens
      });

      const content = response.choices[0].message.content;
      logger.info('AI response generated', { 
        tokens: response.usage.total_tokens 
      });

      return {
        content,
        usage: response.usage
      };
    } catch (error) {
      logger.error('Error generating AI response:', error);
      throw error;
    }
  }

  async analyzeImage(imageUrl, prompt) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { 
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 1000
      });

      logger.info('Image analyzed successfully');
      return response.choices[0].message.content;
    } catch (error) {
      logger.error('Error analyzing image:', error);
      throw error;
    }
  }

  async summarizeConversation(messages) {
    try {
      const conversationText = messages
        .map(m => `${m.direction === 'inbound' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');

      const response = await this.generateResponse([
        {
          role: 'user',
          content: `Please summarize the following conversation:\n\n${conversationText}`
        }
      ], 'You are a helpful assistant that creates concise summaries.');

      return response.content;
    } catch (error) {
      logger.error('Error summarizing conversation:', error);
      throw error;
    }
  }

  async extractIntent(message) {
    try {
      const response = await this.generateResponse([
        {
          role: 'user',
          content: `Analyze this message and determine the user's intent. Return as JSON with fields: intent (string), entities (array), confidence (number 0-1).\n\nMessage: ${message}`
        }
      ], 'You are an intent classification system. Always respond with valid JSON.');

      const result = JSON.parse(response.content);
      logger.info('Intent extracted', { intent: result.intent });
      return result;
    } catch (error) {
      logger.error('Error extracting intent:', error);
      // Return default if parsing fails
      return {
        intent: 'general_query',
        entities: [],
        confidence: 0.5
      };
    }
  }

  buildConversationContext(messages, maxMessages = 10) {
    return messages
      .slice(-maxMessages)
      .map(m => ({
        role: m.direction === 'inbound' ? 'user' : 'assistant',
        content: m.content
      }));
  }
}

module.exports = new AIService();
