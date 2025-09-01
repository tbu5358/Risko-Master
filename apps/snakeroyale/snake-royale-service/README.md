# SnakeRoyale Backend Service

A secure backend service for the SnakeRoyale game that acts as middleware between the frontend UI and Supabase Edge Functions.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [API Development](#api-development)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This backend service provides RESTful APIs and WebSocket connections for the SnakeRoyale game. It handles:

- **Game Management**: Creating, joining, and managing game sessions
- **User Management**: Authentication, profiles, and leaderboards
- **Real-time Communication**: WebSocket connections for live game updates
- **Payment Processing**: Deposit, withdrawal, and balance management
- **Data Persistence**: Integration with Supabase for data storage

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend UI   │◄──►│  Backend Service │◄──►│   Supabase DB   │
│   (React/Vue)   │    │   (Node.js/TS)   │    │   (PostgreSQL)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  WebSocket Server│
                       │  (Real-time)     │
                       └──────────────────┘
```

### Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST APIs
- **WebSocket**: `ws` library for real-time communication
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Security**: Helmet.js, CORS, input validation

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project
- Git

### 1. Clone and Install

   ```bash
git clone <repository-url>
cd snakeroyale-service
   npm install
   ```

### 2. Environment Setup

   Create a `.env` file in the root directory:

   ```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Server Configuration
   PORT=8082
   NODE_ENV=development

# Optional: Logging
LOG_LEVEL=debug
   ```

### 3. Start Development Server

   ```bash
   npm run dev
   ```

The server will start on `http://localhost:8082`

## 🔧 Development Setup

### Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm test` | Run test suite |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

### Code Quality Tools

- **TypeScript**: Static type checking
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks

### IDE Setup

**VS Code Extensions (Recommended):**
- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- REST Client
- Thunder Client (API testing)

**VS Code Settings:**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## 📁 Project Structure

```
snakeroyale-service/
├── src/
│   ├── api/                    # API endpoint handlers
│   │   └── (empty - ready for new endpoints)
│   ├── config/                 # Configuration files
│   │   ├── database.ts         # Database configuration
│   │   └── environment.ts      # Environment variables
│   ├── middleware/             # Express middleware
│   │   ├── auth.ts            # Authentication middleware
│   │   ├── validation.ts      # Input validation
│   │   └── errorHandler.ts    # Error handling
│   ├── models/                 # Data models and types
│   │   ├── User.ts            # User model
│   │   ├── Game.ts            # Game model
│   │   └── Transaction.ts     # Transaction model
│   ├── services/               # Business logic
│   │   ├── GameService.ts     # Game management
│   │   ├── UserService.ts     # User management
│   │   └── PaymentService.ts  # Payment processing
│   ├── utils/                  # Utility functions
│   │   ├── logger.ts          # Logging utilities
│   │   ├── validation.ts      # Validation helpers
│   │   └── crypto.ts          # Cryptographic functions
│   ├── websocket/              # WebSocket handlers
│   │   ├── GameSocket.ts      # Game-related events
│   │   └── ChatSocket.ts      # Chat functionality
│   ├── supabaseClient.ts       # Supabase client configuration
│   ├── utils.ts               # General utilities
│   └── server.ts              # Main server file
├── tests/                      # Test files
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── fixtures/              # Test data
├── docs/                       # Documentation
│   ├── api/                   # API documentation
│   ├── deployment/            # Deployment guides
│   └── troubleshooting/       # Troubleshooting guides
├── scripts/                    # Build and deployment scripts
├── .env.example               # Environment variables template
├── .eslintrc.js              # ESLint configuration
├── .prettierrc               # Prettier configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## 🔌 API Development

### Creating New Endpoints

1. **Create the endpoint file** in `src/api/`:

```typescript
// src/api/example.ts
import { Request, Response } from 'express';
import { validateRequest } from '../middleware/validation';
import { ExampleService } from '../services/ExampleService';

export const createExample = async (req: Request, res: Response) => {
  try {
    // Validate input
    const { error } = validateRequest(req.body, exampleSchema);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // Process request
    const result = await ExampleService.create(req.body);

    // Return response
    res.status(201).json({
      success: true,
      data: result,
      message: 'Example created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
```

2. **Add the route** in `src/server.ts`:

```typescript
import { createExample } from './api/example';

// Add route
app.post('/api/example', createExample);
```

3. **Create service layer** in `src/services/`:

```typescript
// src/services/ExampleService.ts
import { supabase } from '../supabaseClient';

export class ExampleService {
  static async create(data: any) {
    const { data: result, error } = await supabase
      .from('examples')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  }
}
```

### API Response Format

All API responses follow this format:

```typescript
// Success Response
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional message"
}

// Error Response
{
  "success": false,
  "error": "Error message"
}
```

### Error Handling

```typescript
// src/middleware/errorHandler.ts
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
};
```

## 🗄️ Database Schema

### Core Tables

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'waiting',
  max_players INTEGER DEFAULT 4,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Game participants
CREATE TABLE game_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id),
  user_id UUID REFERENCES users(id),
  score INTEGER DEFAULT 0,
  joined_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(20) NOT NULL, -- 'deposit', 'withdraw', 'credit', 'debit'
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --grep "UserService"

# Generate coverage report
npm run test:coverage
```

### Test Structure

```typescript
// tests/unit/services/UserService.test.ts
import { UserService } from '../../../src/services/UserService';

describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser'
      };

      const result = await UserService.createUser(userData);
      
      expect(result).toHaveProperty('id');
      expect(result.email).toBe(userData.email);
    });
  });
});
```

### API Testing

Use the provided test files in `tests/integration/` to test API endpoints:

```typescript
// tests/integration/api/users.test.ts
import request from 'supertest';
import { app } from '../../src/server';

describe('POST /api/users', () => {
  it('should create a new user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        email: 'test@example.com',
        username: 'testuser'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

## 🚀 Deployment

### Environment Setup

1. **Production Environment Variables**:

```env
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_production_key
LOG_LEVEL=info
```

2. **Build Process**:

```bash
npm run build
npm start
```

### Deployment Options

#### Option 1: Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Deploy: `vercel --prod`

#### Option 2: Railway

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

#### Option 3: DigitalOcean App Platform

1. Create new app from GitHub
2. Configure environment variables
3. Deploy

### Health Checks

The service includes health check endpoints:

```bash
# Basic health check
curl http://localhost:8082/health

# Detailed health check
curl http://localhost:8082/health/detailed
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Issues

**Symptoms**: `ECONNREFUSED` or authentication errors

**Solutions**:
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- Check network connectivity
- Ensure Supabase project is active

#### 2. TypeScript Compilation Errors

**Symptoms**: Build fails with type errors

**Solutions**:
```bash
# Clean and rebuild
rm -rf dist/
npm run build

# Check TypeScript configuration
npx tsc --noEmit
```

#### 3. Port Already in Use

**Symptoms**: `EADDRINUSE` error

**Solutions**:
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

#### 4. Environment Variables Not Loading

**Symptoms**: `undefined` values for environment variables

**Solutions**:
- Ensure `.env` file exists in root directory
- Check variable names match exactly
- Restart development server

### Debug Mode

Enable debug logging:

```bash
LOG_LEVEL=debug npm run dev
```

### Performance Monitoring

Monitor application performance:

```bash
# Install monitoring tools
npm install --save-dev clinic

# Run performance analysis
npx clinic doctor -- node dist/server.js
```

## 📚 Additional Resources

### Documentation

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

### Code Style Guide

- Use TypeScript for all new code
- Follow ESLint rules
- Write meaningful commit messages
- Add JSDoc comments for complex functions
- Use meaningful variable and function names

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-endpoint

# Make changes and commit
git add .
git commit -m "feat: add new user endpoint"

# Push and create PR
git push origin feature/new-endpoint
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

---

**Need Help?** 

- Check the [troubleshooting guide](docs/troubleshooting/)
- Review [API documentation](docs/api/)
- Contact the development team

Happy coding! 🚀 