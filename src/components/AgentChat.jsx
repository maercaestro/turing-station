import { useState, useRef, useEffect } from 'react';
import { getAgent } from '../logic/agents.js';
import apiService from '../services/apiService.js';

function AgentChat({ agentId, chatHistory, onUpdateHistory, onAddNote }) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [agentStatus, setAgentStatus] = useState(null);
  const messagesEndRef = useRef(null);
  const agent = getAgent(agentId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, streamingMessage]);

  // Load agent status and chat history
  useEffect(() => {
    const loadAgentData = async () => {
      try {
        // Get agent status
        const statusResponse = await apiService.getAgentStatus(agentId);
        if (statusResponse.success) {
          setAgentStatus(statusResponse.status);
        }

        // If no chat history and agent can answer, add greeting
        if (chatHistory.length === 0 && statusResponse.status?.canAnswer) {
          const greetingResponse = await apiService.getAgentGreeting(agentId);
          if (greetingResponse.success) {
            onUpdateHistory(agentId, greetingResponse.greeting, 'agent');
          }
        }
      } catch (error) {
        console.error('Error loading agent data:', error);
      }
    };

    if (agentId && apiService.getSessionId()) {
      loadAgentData();
    }
  }, [agentId, onUpdateHistory]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    
    // Check if agent can still answer
    if (agentStatus && !agentStatus.canAnswer) {
      onUpdateHistory(agentId, "This agent will not answer any more questions.", 'system');
      return;
    }

    // Add user message to chat
    onUpdateHistory(agentId, userMessage, 'player');
    setIsLoading(true);
    setStreamingMessage('');

    try {
      await apiService.chatWithAgent(
        agentId,
        userMessage,
        // onChunk callback
        (data) => {
          setStreamingMessage(prev => prev + data.content);
        },
        // onComplete callback
        (data) => {
          setIsLoading(false);
          setStreamingMessage('');
          onUpdateHistory(agentId, data.fullResponse, 'agent');
          
          // Update agent status
          setAgentStatus({
            questionCount: data.questionCount,
            remainingQuestions: data.remainingQuestions,
            canAnswer: data.canAnswer,
            maxQuestions: 5
          });
        },
        // onError callback
        (error) => {
          setIsLoading(false);
          setStreamingMessage('');
          
          if (error.message.includes('maximum question limit')) {
            onUpdateHistory(agentId, "This agent has reached the maximum question limit and will not respond to further queries.", 'system');
            setAgentStatus(prev => ({ ...prev, canAnswer: false }));
          } else {
            onUpdateHistory(agentId, `Error: ${error.message}`, 'system');
          }
        }
      );
    } catch (error) {
      setIsLoading(false);
      setStreamingMessage('');
      console.error('Error sending message:', error);
      onUpdateHistory(agentId, `System error: ${error.message}`, 'system');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const addNoteFromMessage = (messageText) => {
    onAddNote(`[${agent.name}]: ${messageText}`);
  };

  return (
    <div className="rounded-xl h-full flex flex-col" style={{ backgroundColor: '#0a1a2e' }}>
      {/* Agent Header */}
      <div className="p-4 border-b" style={{ 
        backgroundColor: '#081421',
        borderBottomColor: '#00d9c0'
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={agent.logo} 
              alt={`${agent.name} Logo`} 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#00d9c0' }}>{agent.name}</h2>
              <p style={{ color: '#a2c2cb' }}>{agent.system} System</p>
            </div>
          </div>
          
          {/* Question Counter */}
          {agentStatus && (
            <div className="text-right">
              <div className="text-sm font-semibold" style={{ color: '#00d9c0' }}>
                Questions: {agentStatus.questionCount || 0}/5
              </div>
              <div className="text-xs" style={{ 
                color: agentStatus.canAnswer ? '#8fffa4' : '#ff6b6b' 
              }}>
                {agentStatus.canAnswer ? 
                  `${agentStatus.remainingQuestions || 5} remaining` : 
                  'Agent is mute'
                }
              </div>
            </div>
          )}
        </div>
        <p className="text-sm mt-2 italic" style={{ color: '#a2c2cb' }}>"{agent.personality}"</p>
        
        {/* Mute Warning */}
        {agentStatus && !agentStatus.canAnswer && (
          <div className="mt-3 p-2 rounded-lg text-center text-sm font-semibold" style={{
            backgroundColor: '#ff6b6b',
            color: 'white'
          }}>
            ⚠️ This agent has reached the maximum question limit and will not respond further.
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" style={{
        maxHeight: 'calc(100vh - 300px)'
      }}>
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'player' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg relative group ${
              msg.sender === 'player' 
                ? 'text-white' 
                : msg.sender === 'system'
                ? 'text-white'
                : 'text-white'
            }`} style={{
              backgroundColor: msg.sender === 'player' 
                ? '#00d9c0' 
                : msg.sender === 'system'
                ? '#ff6b6b'
                : '#081421'
            }}>
              <div className="text-sm">{msg.message}</div>
              <div className={`text-xs mt-1 ${
                msg.sender === 'player' ? 'text-white/80' : ''
              }`} style={{
                color: msg.sender === 'player' ? 'rgba(255,255,255,0.8)' : '#a2c2cb'
              }}>
                {msg.timestamp}
              </div>
              
              {msg.sender === 'agent' && (
                <button
                  onClick={() => addNoteFromMessage(msg.message)}
                  className="absolute -top-2 -right-2 text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white"
                  style={{ backgroundColor: '#8fffa4' }}
                  title="Add to notes"
                >
                  📝
                </button>
              )}
            </div>
          </div>
        ))}
        
        {/* Streaming message */}
        {streamingMessage && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg text-white" style={{ backgroundColor: '#081421' }}>
              <div className="text-sm">{streamingMessage}</div>
              <div className="text-xs mt-1 flex items-center space-x-1" style={{ color: '#a2c2cb' }}>
                <div className="animate-pulse w-2 h-2 rounded-full" style={{ backgroundColor: '#00d9c0' }}></div>
                <span>typing...</span>
              </div>
            </div>
          </div>
        )}
        
        {isLoading && !streamingMessage && (
          <div className="flex justify-start">
            <div className="p-3 rounded-lg text-white" style={{ backgroundColor: '#081421' }}>
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full" style={{ borderColor: '#00d9c0' }}></div>
                <span className="text-sm">{agent.name} is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t" style={{ borderTopColor: '#00d9c0' }}>
        <div className="flex space-x-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask ${agent.name} a question...`}
            className="flex-1 p-3 rounded-lg resize-none focus:outline-none focus:ring-2 text-white"
            style={{ 
              backgroundColor: '#081421',
              focusRingColor: '#00d9c0'
            }}
            rows="2"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim() || isLoading || (agentStatus && !agentStatus.canAnswer)}
            className="text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#00d9c0' }}
            onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#00c5b0')}
            onMouseLeave={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#00d9c0')}
          >
            {(agentStatus && !agentStatus.canAnswer) ? 'Muted' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AgentChat;
