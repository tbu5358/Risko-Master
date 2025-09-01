# Deployment Guide

This guide covers deploying the SnakeRoyale backend service to various platforms.

## Prerequisites

- Node.js 18+ installed
- Git repository access
- Environment variables configured
- Database migrations completed

## Environment Setup

### Required Environment Variables

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Server Configuration
PORT=3000
NODE_ENV=production

# Optional
LOG_LEVEL=info
```

### Database Setup

1. Run Supabase migrations
2. Verify database connections
3. Test with sample data

## Deployment Options

### 1. Vercel (Recommended)

**Pros**: Easy deployment, automatic scaling, edge functions
**Cons**: Limited server-side features

#### Setup Steps:

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

4. Set environment variables in Vercel dashboard

#### Configuration:

Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/server.js"
    }
  ]
}
```

### 2. Railway

**Pros**: Simple deployment, good for Node.js apps
**Cons**: Limited customization

#### Setup Steps:

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### 3. DigitalOcean App Platform

**Pros**: Full control, good performance
**Cons**: More complex setup

#### Setup Steps:

1. Create new app from GitHub
2. Configure build settings
3. Set environment variables
4. Deploy

### 4. Docker Deployment

**Pros**: Consistent environments, easy scaling
**Cons**: More complex initial setup

#### Dockerfile:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY .env ./

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

#### Docker Compose:

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
    restart: unless-stopped
```

## Build Process

### Local Build

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Test build
npm start
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## Health Checks

### Basic Health Check

```bash
curl https://your-api.com/health
```

Expected response:
```json
{
  "success": true,
  "message": "Service is healthy",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Detailed Health Check

```bash
curl https://your-api.com/health/detailed
```

## Monitoring

### Logs

- **Development**: Console logs
- **Production**: Structured JSON logs
- **Error Tracking**: Sentry integration

### Metrics

- Response times
- Error rates
- Memory usage
- CPU usage

### Alerts

- High error rates
- Slow response times
- Service downtime

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript compilation
   - Verify all dependencies installed
   - Check environment variables

2. **Runtime Errors**
   - Check logs for error details
   - Verify database connectivity
   - Check environment configuration

3. **Performance Issues**
   - Monitor resource usage
   - Check database query performance
   - Optimize WebSocket connections

### Rollback Strategy

1. Keep previous deployment
2. Use blue-green deployment
3. Monitor health checks
4. Automatic rollback on failures

## Security

### Environment Variables

- Never commit secrets to Git
- Use secure secret management
- Rotate keys regularly

### Network Security

- Use HTTPS in production
- Configure CORS properly
- Implement rate limiting

### Database Security

- Use connection pooling
- Implement proper authentication
- Regular security updates 