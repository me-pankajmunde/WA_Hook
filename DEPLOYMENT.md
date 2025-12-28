# Deployment Guide

## Prerequisites

1. Node.js 18+ installed
2. PostgreSQL 14+ database
3. Redis server (optional, for job queues)
4. Domain name with SSL certificate
5. WhatsApp Business API credentials
6. OpenAI API key

## Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Fill in all required environment variables in `.env`:
   - Database credentials
   - WhatsApp API credentials
   - OpenAI API key
   - JWT secret
   - Other service credentials

## Database Setup

1. Create PostgreSQL database:
```bash
createdb wa_assistant
```

2. Update the `DATABASE_URL` in your `.env` file

3. The application will automatically sync database models on startup in development mode

## Installation

```bash
npm install
```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## WhatsApp Webhook Configuration

1. Deploy your application to a publicly accessible server with HTTPS

2. Configure webhook in WhatsApp Business API:
   - Webhook URL: `https://your-domain.com/webhook`
   - Verify Token: Use the value from `VERIFY_TOKEN` in your `.env`

3. Subscribe to these webhook fields:
   - messages
   - message_status (optional)

## Deployment Platforms

### Heroku

1. Create a new Heroku app:
```bash
heroku create your-app-name
```

2. Add PostgreSQL addon:
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

3. Add Redis addon (optional):
```bash
heroku addons:create heroku-redis:hobby-dev
```

4. Set environment variables:
```bash
heroku config:set VERIFY_TOKEN=your_token
heroku config:set WHATSAPP_TOKEN=your_whatsapp_token
# ... set all other variables
```

5. Deploy:
```bash
git push heroku main
```

### Render

1. Create a new Web Service on Render

2. Connect your GitHub repository

3. Configure environment variables in Render dashboard

4. Render will automatically detect and run `npm start`

### Docker

1. Build the Docker image:
```bash
docker build -t wa-assistant .
```

2. Run with docker-compose:
```bash
docker-compose up -d
```

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Configure proper database backups
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure CORS properly
- [ ] Review and secure all API endpoints
- [ ] Set up automated backups for uploaded media

## Monitoring

The application uses Winston for logging. Logs are stored in:
- `logs/error.log` - Error logs only
- `logs/combined.log` - All logs

Consider integrating with external monitoring services:
- Application Performance Monitoring (APM)
- Error tracking (Sentry, Rollbar)
- Log aggregation (Papertrail, Loggly)

## Scaling Considerations

1. **Database**: Use connection pooling and read replicas for high traffic
2. **Media Storage**: Move to S3 or similar object storage
3. **Job Queue**: Use Redis with Bull for async processing
4. **Caching**: Implement Redis caching for frequent queries
5. **Load Balancing**: Use multiple instances behind a load balancer

## Security Best Practices

1. Keep all dependencies updated
2. Use environment variables for secrets
3. Enable rate limiting on all endpoints
4. Validate and sanitize all inputs
5. Use HTTPS only
6. Implement proper authentication and authorization
7. Regular security audits
8. Keep logs secure and monitor for suspicious activity

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if PostgreSQL is running
- Ensure firewall allows connections

### WhatsApp Webhook Not Working
- Verify webhook URL is publicly accessible
- Check VERIFY_TOKEN matches
- Review webhook logs for errors
- Ensure HTTPS is configured correctly

### Media Upload Failures
- Check upload directory permissions
- Verify disk space availability
- Review file size limits

## Support

For issues and questions:
- GitHub Issues: [Repository Issues Page]
- Documentation: README.md
