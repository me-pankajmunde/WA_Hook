# Quick Start Guide

Get the WhatsApp AI Assistant running in 5 minutes!

## Prerequisites

- Node.js 18+
- PostgreSQL running locally or accessible remotely

## Setup Steps

### 1. Clone and Install

```bash
git clone https://github.com/me-pankajmunde/WA_Hook.git
cd WA_Hook
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and set minimum required variables:

```env
PORT=3000
VERIFY_TOKEN=your_webhook_token_here
WHATSAPP_TOKEN=your_whatsapp_api_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
DATABASE_URL=postgresql://user:password@localhost:5432/wa_assistant
OPENAI_API_KEY=your_openai_key
JWT_SECRET=your_random_secret_key
```

### 3. Setup Database

```bash
# Create database
createdb wa_assistant

# The app will auto-create tables on first run
```

### 4. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

### 5. Test the API

```bash
# Check health
curl http://localhost:3000/api/health

# Response should be:
# {"status":"ok","timestamp":"...","uptime":...}
```

## WhatsApp Configuration

### Set Up Webhook

1. Go to your WhatsApp Business API dashboard
2. Configure webhook:
   - **URL**: `https://your-domain.com/webhook`
   - **Verify Token**: Use value from `VERIFY_TOKEN` in `.env`
3. Subscribe to `messages` events

### Test Webhook

Send a message to your WhatsApp Business number. You should see:
- Log in console showing incoming message
- AI response sent back to you

## Using the API

### Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "name": "Test User",
    "password": "securepass123"
  }'
```

### Login and Get Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "password": "securepass123"
  }'
```

Save the returned `token` for authenticated requests.

### Get Your Sessions

```bash
curl http://localhost:3000/api/sessions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Docker Quick Start

If you prefer Docker:

```bash
# Start all services (app, database, redis)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: Ensure PostgreSQL is running and `DATABASE_URL` is correct.

### WhatsApp Webhook Verification Failed

**Solution**: 
1. Check `VERIFY_TOKEN` matches in both `.env` and WhatsApp settings
2. Ensure your webhook URL is publicly accessible with HTTPS

### OpenAI API Error

```
Error: Invalid API key
```

**Solution**: Verify your `OPENAI_API_KEY` in `.env` is valid.

## Next Steps

- Read the full [README.md](README.md) for detailed features
- Check [API.md](API.md) for complete API documentation
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Explore the code in `src/` directory

## Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run linter
npm run lint
```

## Getting Help

- Check existing [GitHub Issues](https://github.com/me-pankajmunde/WA_Hook/issues)
- Read the documentation files in the repository
- Review the logs in `logs/` directory

## What's Working

✅ WhatsApp message receiving and sending
✅ AI-powered responses using OpenAI
✅ Media download and storage
✅ Session management
✅ User authentication
✅ RESTful API
✅ Database integration
✅ Logging system

## Coming Soon

🔄 OCR text extraction from images
🔄 GitHub repository creation
🔄 Frontend dashboard
🔄 Vector database integration
🔄 Advanced analytics

Enjoy building with the WhatsApp AI Assistant! 🚀
