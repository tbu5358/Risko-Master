# SpeedChess Backend Service

A secure backend service for the SpeedChess game that acts as middleware between the frontend UI and Supabase Edge Functions.

## 🏗️ Structure

```
speedchess-service/
├── src/
│   ├── api/
│   │   ├── createMatch.ts
│   │   ├── joinMatch.ts
│   │   ├── cancelMatch.ts
│   │   ├── completeMatch.ts
│   │   ├── leaderboard.ts
│   │   └── getActiveMatches.ts
│   ├── supabaseClient.ts
│   ├── utils.ts
│   └── server.ts
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   SUPABASE_URL=https://icrihendalnvswmpgeai.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
PORT=8081
   NODE_ENV=development
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## 📡 API Endpoints

### POST `/api/create-match`
Creates a new chess match.

**Request Body:**
```json
{
  "user_id": "uuid",
  "time_control": "blitz|rapid|classical",
  "variant": "standard|chess960|atomic",
  "is_public": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "match_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Match created successfully"
}
```

### POST `/api/join-match`
Joins an existing match.

**Request Body:**
```json
{
  "match_id": "uuid",
  "user_id": "uuid"
}
```

### POST `/api/cancel-match`
Cancels an active match.

**Request Body:**
```json
{
  "match_id": "uuid",
  "user_id": "uuid"
}
```

### POST `/api/complete-match`
Completes a match with results.

**Request Body:**
```json
{
  "match_id": "uuid",
  "winner_id": "uuid",
  "result": "white_win|black_win|draw|abandoned",
  "moves": ["e4", "e5", "Nf3"]
}
```

### GET `/api/leaderboard`
Retrieves the leaderboard.

**Query Parameters:**
- `limit` (optional): Number of results (1-100, default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `time_control` (optional): Filter by time control

### GET `/api/get-active-matches`
Retrieves active matches.

**Query Parameters:**
- `limit` (optional): Number of results (1-100, default: 20)
- `offset` (optional): Pagination offset (default: 0)
- `time_control` (optional): Filter by time control
- `variant` (optional): Filter by chess variant

### POST `/api/deposit`
Process a deposit transaction.

**Request Body:**
```json
{
  "user_id": "uuid",
  "amount": 100.00,
  "currency": "USD",
  "description": "Deposit via credit card"
}
```

### POST `/api/withdraw`
Process a withdrawal transaction.

**Request Body:**
```json
{
  "user_id": "uuid",
  "amount": 50.00,
  "currency": "USD",
  "description": "Withdrawal to bank account"
}
```

### POST `/api/balance`
Get user balance.

**Request Body:**
```json
{
  "user_id": "uuid",
  "currency": "USD"
}
```

### POST `/api/internal-credit`
Process internal credit (admin function).

**Request Body:**
```json
{
  "user_id": "uuid",
  "amount": 25.00,
  "currency": "USD",
  "reason": "bonus",
  "description": "Welcome bonus"
}
```

### POST `/api/internal-debit`
Process internal debit (admin function).

**Request Body:**
```json
{
  "user_id": "uuid",
  "amount": 10.00,
  "currency": "USD",
  "reason": "fee",
  "description": "Transaction fee"
}
```

### POST `/api/deposit-webhook`
Handle deposit webhook from payment processor.

**Request Body:**
```json
{
  "transaction_id": "txn_123",
  "user_id": "uuid",
  "amount": 100.00,
  "currency": "USD",
  "status": "completed",
  "metadata": {}
}
```

### POST `/api/withdraw-webhook`
Handle withdrawal webhook from payment processor.

**Request Body:**
```json
{
  "transaction_id": "txn_456",
  "user_id": "uuid",
  "amount": 50.00,
  "currency": "USD",
  "status": "completed",
  "metadata": {}
}
```

### GET `/health`
Health check endpoint.

## 🔌 WebSocket Server

The service also includes a WebSocket server for real-time communication:

- **Port:** Same as HTTP server (default: 8081)
- **Protocol:** `ws://localhost:8081`

### WebSocket Events

**Join Match:**
```json
{
  "type": "join",
  "matchId": "uuid",
  "username": "player_name"
}
```

**User Joined (broadcasted to others):**
```json
{
  "type": "user-joined",
  "username": "player_name"
}
```

## 🛡️ Security Features

- **Helmet.js** for security headers
- **CORS** configuration for cross-origin requests
- **Input validation** on all endpoints
- **UUID validation** for match and user IDs
- **Rate limiting** (can be added)
- **Service role key** never exposed to frontend

## 🔧 Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `PORT` | Server port | No (default: 8081) |
| `NODE_ENV` | Environment mode | No (default: development) |

## 📦 Dependencies

### Production
- `express` - Web framework
- `@supabase/supabase-js` - Supabase client
- `ws` - WebSocket server
- `cors` - CORS middleware
- `helmet` - Security middleware
- `dotenv` - Environment variables

### Development
- `typescript` - TypeScript compiler
- `ts-node` - TypeScript execution
- `@types/express` - Express type definitions
- `@types/ws` - WebSocket type definitions
- `@types/cors` - CORS type definitions
- `@types/node` - Node.js type definitions

## 🔄 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

## 🚀 Deployment

1. Build the project: `npm run build`
2. Set production environment variables
3. Start the server: `npm start`

The service is designed to run alongside your Supabase Edge Functions and frontend application. 