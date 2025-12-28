const request = require('supertest');
const app = require('../src/index');

describe('API Health Check', () => {
  it('should return 200 on health endpoint', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body.status).toBe('ok');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });

  it('should return 200 on root endpoint', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);
    
    expect(response.body.name).toBe('WhatsApp AI Assistant');
    expect(response.body.status).toBe('running');
  });

  it('should return 404 for unknown routes', async () => {
    await request(app)
      .get('/unknown-route')
      .expect(404);
  });
});

describe('Webhook Verification', () => {
  it('should verify webhook with correct token', async () => {
    const token = process.env.VERIFY_TOKEN || 'test-token';
    
    const response = await request(app)
      .get('/webhook')
      .query({
        'hub.mode': 'subscribe',
        'hub.verify_token': token,
        'hub.challenge': 'test-challenge'
      })
      .expect(200);
    
    expect(response.text).toBe('test-challenge');
  });

  it('should reject webhook with incorrect token', async () => {
    await request(app)
      .get('/webhook')
      .query({
        'hub.mode': 'subscribe',
        'hub.verify_token': 'wrong-token',
        'hub.challenge': 'test-challenge'
      })
      .expect(403);
  });
});
