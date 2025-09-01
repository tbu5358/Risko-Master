# API Documentation

This directory contains detailed API documentation for the SnakeRoyale backend service.

## Structure

- `endpoints/` - Individual endpoint documentation
- `schemas/` - Request/response schemas
- `examples/` - API usage examples
- `authentication.md` - Authentication guide
- `rate-limits.md` - Rate limiting information

## Quick Reference

### Base URL
- Development: `http://localhost:8082`
- Production: `https://api.snakeroyale.com`

### Authentication
All API requests require authentication via Supabase JWT tokens.

### Response Format
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional message"
}
```

### Error Format
```json
{
  "success": false,
  "error": "Error message",
  "details": ["Validation errors"]
}
```

## Endpoints

### Game Management
- `POST /api/games` - Create a new game
- `GET /api/games` - Get active games
- `POST /api/games/:id/join` - Join a game
- `POST /api/games/:id/leave` - Leave a game
- `POST /api/games/:id/start` - Start a game
- `POST /api/games/:id/end` - End a game

### WebSocket Events
- `join_game` - Join a game room
- `leave_game` - Leave a game room
- `game_action` - Send game action
- `chat_message` - Send chat message

## Rate Limits

- **Authentication**: 100 requests per minute
- **Game Creation**: 10 requests per minute
- **Game Joining**: 30 requests per minute
- **WebSocket Messages**: 100 messages per minute

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error 