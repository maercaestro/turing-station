import express from 'express';
import sessionManager from '../services/SessionManager.js';
import getOpenAIService from '../services/OpenAIService.js';
import { agents, getAgent } from '../models/GameSession.js';

const router = express.Router();

// Get all agents
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      agents: agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        system: agent.system,
        logo: agent.logo,
        description: agent.description,
        color: agent.color
      }))
    });
  } catch (error) {
    console.error('Error getting agents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get agents'
    });
  }
});

// Get specific agent info
router.get('/:agentId', (req, res) => {
  try {
    const { agentId } = req.params;
    const agent = getAgent(agentId);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    res.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        system: agent.system,
        logo: agent.logo,
        description: agent.description,
        color: agent.color
      }
    });
  } catch (error) {
    console.error('Error getting agent:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get agent information'
    });
  }
});

// Get agent greeting
router.get('/:agentId/greeting', (req, res) => {
  try {
    const { agentId } = req.params;
    const agent = getAgent(agentId);
    
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    const openAIService = getOpenAIService();
    const greeting = openAIService.generateAgentGreeting(agentId);
    
    res.json({
      success: true,
      agentId,
      greeting
    });
  } catch (error) {
    console.error('Error getting agent greeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get agent greeting'
    });
  }
});

// Chat with agent (streaming response)
router.post('/:agentId/chat', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { message, sessionId } = req.body;
    
    // Validate inputs
    if (!message || !sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Message and session ID are required'
      });
    }

    const agent = getAgent(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    const session = sessionManager.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Check if agent can still answer questions
    if (!session.canAgentAnswer(agentId)) {
      return res.status(403).json({
        success: false,
        error: 'Agent has reached maximum question limit',
        questionCount: session.questionCounts[agentId],
        maxQuestions: parseInt(process.env.MAX_QUESTIONS_PER_AGENT) || 5
      });
    }

    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    try {
      // Add player message to chat history
      session.addMessage(agentId, 'player', message);
      
      // Increment question count
      session.incrementQuestionCount(agentId);
      
      // Get chat history for context
      const chatHistory = session.chatHistory[agentId] || [];
      
      // Generate AI response with streaming
      const openAIService = getOpenAIService();
      const stream = await openAIService.generateResponse(
        agentId,
        message,
        chatHistory,
        session.isKiller(agentId)
      );

      let fullResponse = '';

      // Stream response to client
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          
          // Send chunk to client
          res.write(`data: ${JSON.stringify({
            type: 'chunk',
            content,
            agentId,
            questionCount: session.questionCounts[agentId],
            remainingQuestions: session.getRemainingQuestions(agentId)
          })}\n\n`);
        }
      }

      // Add AI response to chat history
      session.addMessage(agentId, 'agent', fullResponse);

      // Send completion message
      res.write(`data: ${JSON.stringify({
        type: 'complete',
        agentId,
        fullResponse,
        questionCount: session.questionCounts[agentId],
        remainingQuestions: session.getRemainingQuestions(agentId),
        canAnswer: session.canAgentAnswer(agentId)
      })}\n\n`);

      res.end();

    } catch (aiError) {
      console.error('AI generation error:', aiError);
      
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: 'Failed to generate response',
        details: aiError.message
      })}\n\n`);
      
      res.end();
    }

  } catch (error) {
    console.error('Error in agent chat:', error);
    
    // If headers haven't been sent yet, send JSON error
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Failed to process chat message'
      });
    } else {
      // If streaming has started, send error event
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: 'Server error occurred'
      })}\n\n`);
      res.end();
    }
  }
});

// Get agent status in a session
router.get('/:agentId/status/:sessionId', (req, res) => {
  try {
    const { agentId, sessionId } = req.params;
    
    const agent = getAgent(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    const session = sessionManager.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      agentId,
      status: {
        questionCount: session.questionCounts[agentId] || 0,
        remainingQuestions: session.getRemainingQuestions(agentId),
        canAnswer: session.canAgentAnswer(agentId),
        maxQuestions: parseInt(process.env.MAX_QUESTIONS_PER_AGENT) || 5
      }
    });
  } catch (error) {
    console.error('Error getting agent status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get agent status'
    });
  }
});

export default router;
