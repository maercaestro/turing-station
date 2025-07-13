import express from 'express';
import sessionManager from '../services/SessionManager.js';
import getOpenAIService from '../services/OpenAIService.js';

const router = express.Router();

// Create new game session
router.post('/new', (req, res) => {
  try {
    const session = sessionManager.createSession();
    
    res.json({
      success: true,
      sessionId: session.id,
      gamePhase: session.gamePhase,
      questionCounts: session.questionCounts,
      remainingQuestions: session.getRemainingQuestionsForAllAgents(),
      message: 'New game session created successfully'
    });
  } catch (error) {
    console.error('Error creating new game:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create new game session'
    });
  }
});

// Get game session info
router.get('/session/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = sessionManager.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      session: {
        id: session.id,
        gamePhase: session.gamePhase,
        questionCounts: session.questionCounts,
        remainingQuestions: session.getRemainingQuestionsForAllAgents(),
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        isActive: session.isActive
      }
    });
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session information'
    });
  }
});

// Get chat history for specific agent
router.get('/session/:sessionId/chat/:agentId', (req, res) => {
  try {
    const { sessionId, agentId } = req.params;
    const session = sessionManager.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    const chatHistory = session.chatHistory[agentId] || [];
    const remainingQuestions = session.getRemainingQuestions(agentId);
    const canAnswer = session.canAgentAnswer(agentId);

    res.json({
      success: true,
      agentId,
      chatHistory,
      questionCount: session.questionCounts[agentId] || 0,
      remainingQuestions,
      canAnswer,
      isActive: session.isActive
    });
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get chat history'
    });
  }
});

// End game session
router.post('/session/:sessionId/end', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = sessionManager.endSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      message: 'Game session ended',
      killer: session.killer, // Reveal the killer when game ends
      session: session.getSummary()
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end game session'
    });
  }
});

// Make accusation
router.post('/session/:sessionId/accuse', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { suspectId } = req.body;
    
    const session = sessionManager.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    if (!suspectId) {
      return res.status(400).json({
        success: false,
        error: 'Suspect ID is required'
      });
    }

    const isCorrect = session.isKiller(suspectId);
    session.gamePhase = 'verdict';
    
    res.json({
      success: true,
      accusation: {
        suspectId,
        isCorrect,
        actualKiller: session.killer,
        murderScenario: session.getMurderScenario()
      },
      gamePhase: session.gamePhase,
      message: isCorrect ? 'Correct! You solved the mystery!' : 'Incorrect. Game over.'
    });
  } catch (error) {
    console.error('Error processing accusation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process accusation'
    });
  }
});

// Get session statistics (for debugging)
router.get('/stats', (req, res) => {
  try {
    const stats = sessionManager.getStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics'
    });
  }
});

// Test OpenAI connection
router.get('/test-ai', async (req, res) => {
  try {
    const openAIService = getOpenAIService();
    const result = await openAIService.testConnection();
    res.json({
      success: result.success,
      openai: result
    });
  } catch (error) {
    console.error('Error testing AI connection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test AI connection'
    });
  }
});

export default router;
