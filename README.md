# WhatsApp AI Assistant & Builder Platform

A comprehensive AI-powered assistant accessible via WhatsApp that can accept screenshots, text, and commands, provide conversational assistance, and build software artifacts.

## Features

### Phase 1 - Current Implementation
- ✅ WhatsApp webhook integration with message handling
- ✅ Multi-format message support (text, images, documents, audio, video)
- ✅ User and session management
- ✅ AI-powered conversational responses using OpenAI
- ✅ Media download and storage
- ✅ Image processing with thumbnails
- ✅ Database integration with PostgreSQL
- ✅ Comprehensive logging system

### Planned Features
- Screenshot intelligence with OCR
- GitHub integration for code generation
- Vector database for semantic search
- Redis caching and job queuing
- Frontend dashboard (React/Next.js)
- Analytics and insights
- End-of-day summaries

## Architecture

```
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── models/          # Database models
│   ├── services/        # Business logic
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utility functions
│   └── index.js         # Application entry point
├── uploads/             # Media storage
├── logs/                # Application logs
└── tests/               # Test files
```

## Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis (optional, for caching)
- WhatsApp Business API account
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/me-pankajmunde/WA_Hook.git
cd WA_Hook
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. Setup database:
```bash
# Create PostgreSQL database
createdb wa_assistant

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://user:password@localhost:5432/wa_assistant
```

5. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## Configuration

### Environment Variables

Key environment variables to configure:

- `PORT` - Server port (default: 3000)
- `VERIFY_TOKEN` - WhatsApp webhook verification token
- `WHATSAPP_TOKEN` - WhatsApp API token
- `WHATSAPP_PHONE_NUMBER_ID` - Your WhatsApp phone number ID
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key for AI responses
- `REDIS_URL` - Redis connection string (optional)

See `.env.example` for complete list.

### WhatsApp Webhook Setup

1. Configure webhook URL: `https://your-domain.com/webhook`
2. Set verify token in WhatsApp Business settings
3. Subscribe to message events

## API Endpoints

### Webhook
- `GET /webhook` - Webhook verification
- `POST /webhook` - Message handling

### Health
- `GET /api/health` - Health check endpoint

## Database Schema

### Users
- User profiles and preferences
- Phone number mapping
- Activity tracking

### Sessions
- Daily or task-based sessions
- Session metadata and status

### Messages
- Message history
- Direction (inbound/outbound)
- Media references

### Media
- File storage information
- OCR extracted text
- Classification results

### Artifacts
- Generated code and documents
- Repository links
- Build outputs

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL, Sequelize ORM
- **Caching**: Redis, ioredis
- **AI/ML**: OpenAI API
- **Storage**: Local filesystem (S3 planned)
- **Logging**: Winston
- **Image Processing**: Sharp

## Security

- Helmet.js for security headers
- JWT for authentication
- Environment-based secrets
- Rate limiting (planned)
- Input validation with Joi

## License

MIT

## Contributing

Contributions welcome! Please open an issue or submit a pull request.

## Support

For issues and questions, please open a GitHub issue.
