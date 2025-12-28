// Image classification categories
const IMAGE_CATEGORIES = [
  'error_screenshot',
  'code_snippet',
  'ui_design',
  'diagram',
  'note',
  'document',
  'other'
];

// OCR API configuration
const OCR_CONFIG = {
  language: 'eng',
  isOverlayRequired: false,
  detectOrientation: true
};

// AI system prompts
const AI_PROMPTS = {
  imageClassification: `Classify this image into one of these categories: ${IMAGE_CATEGORIES.join(', ')}. Return only the category name.`,
  textExtraction: 'Extract all text from this image. If there is no text, describe what you see.',
  conversationalAssistant: `You are a helpful AI assistant integrated with WhatsApp. 
You help users with various tasks including:
- Answering questions
- Analyzing screenshots and images
- Helping with coding tasks
- Providing summaries and insights
- Assisting with productivity

Be concise and friendly. Keep responses short and to the point for WhatsApp.`
};

module.exports = {
  IMAGE_CATEGORIES,
  OCR_CONFIG,
  AI_PROMPTS
};
