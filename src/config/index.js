require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  whatsapp: {
    verifyToken: process.env.VERIFY_TOKEN,
    token: process.env.WHATSAPP_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    apiVersion: 'v18.0',
    apiUrl: 'https://graph.facebook.com'
  },
  
  database: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4-turbo-preview',
      temperature: 0.7,
      maxTokens: 2000
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: 'claude-3-opus-20240229'
    }
  },
  
  ocr: {
    apiKey: process.env.OCR_API_KEY
  },
  
  github: {
    token: process.env.GITHUB_TOKEN,
    username: process.env.GITHUB_USERNAME
  },
  
  storage: {
    type: process.env.STORAGE_TYPE || 'local',
    localPath: './uploads',
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      bucketName: process.env.AWS_BUCKET_NAME,
      region: process.env.AWS_REGION || 'us-east-1'
    }
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3001'
  },
  
  vectorDb: {
    pinecone: {
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT
    }
  }
};
