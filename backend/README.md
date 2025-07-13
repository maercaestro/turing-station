# Turing Station Backend

Backend API for the Turing Station AI Whodunit game. This Node.js/Express server provides streaming AI responses using OpenAI's GPT-4o-mini model and manages game sessions with a 5-question limit per agent.

## Features

- **Streaming AI Responses**: Real-time streaming responses using Server-Sent Events (SSE)
- **Session Management**: In-memory session management with automatic cleanup
- **Question Limits**: Each AI agent can only answer 5 questions per game session
- **Multiple Agents**: 5 unique AI personalities with different backstories and alibis
- **Random Killer**: Each game randomly selects which agent is the murderer
- **Cost Efficient**: Uses GPT-4o-mini for affordable AI responses

## Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
MAX_QUESTIONS_PER_AGENT=5
SESSION_TIMEOUT_MINUTES=60
```

### 3. Start the Server
```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

## API Endpoints

### Game Management
- `POST /api/game/new` - Create new game session
- `GET /api/game/session/:sessionId` - Get session info
- `GET /api/game/session/:sessionId/chat/:agentId` - Get chat history
- `POST /api/game/session/:sessionId/end` - End game session
- `POST /api/game/session/:sessionId/accuse` - Make accusation
- `GET /api/game/stats` - Get server statistics
- `GET /api/game/test-ai` - Test OpenAI connection

### Agent Interaction
- `GET /api/agents` - Get all agents
- `GET /api/agents/:agentId` - Get agent info
- `GET /api/agents/:agentId/greeting` - Get agent greeting
- `POST /api/agents/:agentId/chat` - Chat with agent (streaming)
- `GET /api/agents/:agentId/status/:sessionId` - Get agent status

### Health Check
- `GET /health` - Server health check

## Streaming Chat API

The chat endpoint uses Server-Sent Events for real-time streaming:

```javascript
// POST /api/agents/:agentId/chat
{
  "message": "What were you doing when Dr. Rao died?",
  "sessionId": "uuid-session-id"
}
```

**Response Stream Events:**
```javascript
// Content chunks
{ "type": "chunk", "content": "I was...", "agentId": "ORBITA" }

// Completion
{ 
  "type": "complete", 
  "agentId": "ORBITA",
  "fullResponse": "Complete response...",
  "questionCount": 1,
  "remainingQuestions": 4,
  "canAnswer": true
}

// Errors
{ "type": "error", "error": "Error message" }
```

## Game Logic

### Agents
- **ORBITA** (Navigation) - Calculating and methodical
- **ARIS** (Life Support) - Anxious and helpful
- **HEX** (Security) - Cold and defensive
- **LUMA** (Communications) - Chatty and dramatic
- **DAEL** (Research & Data) - Analytical and curious

### Question Limits
- Each agent can answer maximum 5 questions per session
- After 5 questions, agent becomes "mute"
- Question count persists throughout the session
- Frontend should handle muted agent UI

### Session Management
- Sessions auto-expire after 60 minutes of inactivity
- In-memory storage (consider Redis for production)
- Session cleanup runs every 10 minutes

## Development

### Project Structure
```
backend/
├── models/
│   └── GameSession.js     # Game session data model
├── services/
│   ├── SessionManager.js  # Session management
│   └── OpenAIService.js   # OpenAI integration
├── routes/
│   ├── game.js           # Game endpoints
│   └── agents.js         # Agent endpoints
├── server.js             # Main server file
├── package.json
└── .env.example
```

### Error Handling
- Comprehensive error handling with appropriate HTTP status codes
- Streaming errors are sent as SSE events
- Development vs production error details

### Security
- CORS configuration for frontend domains
- Rate limiting (100 requests per 15 minutes)
- Helmet.js security headers
- Input validation

## Production Deployment

### Environment Variables
```env
NODE_ENV=production
OPENAI_API_KEY=your_production_key
PORT=3001
MAX_QUESTIONS_PER_AGENT=5
SESSION_TIMEOUT_MINUTES=60
```

### Considerations
- Use Redis for session storage in production
- Set up proper logging (Winston, etc.)
- Configure monitoring and health checks
- Update CORS origins for production domains
- Consider database for persistent game statistics

## Testing

Test the API endpoints:

```bash
# Health check
curl http://localhost:3001/health

# Create new game
curl -X POST http://localhost:3001/api/game/new

# Test AI connection
curl http://localhost:3001/api/game/test-ai
```

## Troubleshooting

### Common Issues
1. **OpenAI API Key**: Ensure valid API key is set in `.env`
2. **Port Conflicts**: Change PORT in `.env` if 3001 is in use
3. **CORS Errors**: Update CORS origins in `server.js`
4. **Memory Usage**: Sessions accumulate in memory; monitor in production

### Logging
Server logs include:
- Session creation/deletion
- AI response generation
- Error details (development mode)
- Session cleanup activities
