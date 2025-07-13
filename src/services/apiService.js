// API service for communicating with the Turing Station backend

class APIService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    this.sessionId = null;
  }

  // Set session ID for subsequent requests
  setSessionId(sessionId) {
    this.sessionId = sessionId;
    localStorage.setItem('turingStationSessionId', sessionId);
  }

  // Get session ID from memory or localStorage
  getSessionId() {
    if (!this.sessionId) {
      this.sessionId = localStorage.getItem('turingStationSessionId');
    }
    return this.sessionId;
  }

  // Clear session
  clearSession() {
    this.sessionId = null;
    localStorage.removeItem('turingStationSessionId');
  }

  // Generic fetch wrapper
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Game Management APIs
  async createNewGame() {
    const response = await this.apiCall('/game/new', { method: 'POST' });
    if (response.success) {
      this.setSessionId(response.sessionId);
    }
    return response;
  }

  async getSessionInfo(sessionId = null) {
    const id = sessionId || this.getSessionId();
    if (!id) throw new Error('No session ID available');
    
    return await this.apiCall(`/game/session/${id}`);
  }

  async endGame(sessionId = null) {
    const id = sessionId || this.getSessionId();
    if (!id) throw new Error('No session ID available');
    
    const response = await this.apiCall(`/game/session/${id}/end`, { method: 'POST' });
    if (response.success) {
      this.clearSession();
    }
    return response;
  }

  async makeAccusation(suspectId, sessionId = null) {
    const id = sessionId || this.getSessionId();
    if (!id) throw new Error('No session ID available');
    
    return await this.apiCall(`/game/session/${id}/accuse`, {
      method: 'POST',
      body: JSON.stringify({ suspectId })
    });
  }

  async getChatHistory(agentId, sessionId = null) {
    const id = sessionId || this.getSessionId();
    if (!id) throw new Error('No session ID available');
    
    return await this.apiCall(`/game/session/${id}/chat/${agentId}`);
  }

  // Agent APIs
  async getAllAgents() {
    return await this.apiCall('/agents');
  }

  async getAgent(agentId) {
    return await this.apiCall(`/agents/${agentId}`);
  }

  async getAgentGreeting(agentId) {
    return await this.apiCall(`/agents/${agentId}/greeting`);
  }

  async getAgentStatus(agentId, sessionId = null) {
    const id = sessionId || this.getSessionId();
    if (!id) throw new Error('No session ID available');
    
    return await this.apiCall(`/agents/${agentId}/status/${id}`);
  }

  // Streaming chat with agent
  async chatWithAgent(agentId, message, onChunk, onComplete, onError) {
    const sessionId = this.getSessionId();
    if (!sessionId) throw new Error('No session ID available');

    const url = `${this.baseURL}/agents/${agentId}/chat`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, sessionId })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      // Check if agent is muted (403 status)
      if (response.status === 403) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case 'chunk':
                  onChunk && onChunk(data);
                  break;
                case 'complete':
                  onComplete && onComplete(data);
                  return; // End processing
                case 'error':
                  onError && onError(new Error(data.error));
                  return;
              }
            } catch (parseError) {
              console.error('Error parsing SSE data:', parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming chat error:', error);
      onError && onError(error);
      throw error;
    }
  }

  // Health check
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', error: error.message };
    }
  }

  // Test AI connection
  async testAI() {
    return await this.apiCall('/game/test-ai');
  }

  // Get server stats
  async getStats() {
    return await this.apiCall('/game/stats');
  }
}

// Create singleton instance
const apiService = new APIService();

export default apiService;
