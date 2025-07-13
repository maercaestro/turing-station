import { v4 as uuidv4 } from 'uuid';
import { GameSession } from '../models/GameSession.js';

class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.sessionTimeout = (parseInt(process.env.SESSION_TIMEOUT_MINUTES) || 60) * 60 * 1000; // Convert to milliseconds
    
    // Clean up expired sessions every 10 minutes
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 10 * 60 * 1000);
  }

  // Create a new game session
  createSession() {
    const sessionId = uuidv4();
    const session = new GameSession(sessionId);
    this.sessions.set(sessionId, session);
    
    console.log(`📝 Created new game session: ${sessionId}`);
    console.log(`🎲 Killer selected: ${session.killer}`);
    
    return session;
  }

  // Get session by ID
  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.updateLastActivity();
    }
    return session;
  }

  // Get or create session
  getOrCreateSession(sessionId) {
    if (sessionId && this.sessions.has(sessionId)) {
      return this.getSession(sessionId);
    }
    return this.createSession();
  }

  // Delete session
  deleteSession(sessionId) {
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      console.log(`🗑️  Deleted session: ${sessionId}`);
    }
    return deleted;
  }

  // Clean up expired sessions
  cleanupExpiredSessions() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      const sessionAge = now - session.lastActivity.getTime();
      
      if (sessionAge > this.sessionTimeout) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
    }
  }

  // Get session statistics
  getStats() {
    const totalSessions = this.sessions.size;
    const activeSessions = Array.from(this.sessions.values())
      .filter(session => session.isActive).length;
    
    return {
      totalSessions,
      activeSessions,
      sessionTimeout: this.sessionTimeout,
      timestamp: new Date().toISOString()
    };
  }

  // List all sessions (for debugging)
  listSessions() {
    return Array.from(this.sessions.values()).map(session => ({
      id: session.id,
      killer: session.killer,
      gamePhase: session.gamePhase,
      questionCounts: session.questionCounts,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      isActive: session.isActive
    }));
  }

  // End a game session
  endSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      session.gamePhase = 'ended';
      console.log(`🏁 Ended game session: ${sessionId}`);
      return session;
    }
    return null;
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

export default sessionManager;
