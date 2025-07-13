import { useState, useEffect } from 'react';
import { agents } from '../logic/agents.js';
import apiService from '../services/apiService.js';
import AISelector from '../components/AISelector.jsx';
import AgentChat from '../components/AgentChat.jsx';
import Notebook from '../components/Notebook.jsx';
import AccusationPanel from '../components/AccusationPanel.jsx';

function Game() {
  const [selectedAgent, setSelectedAgent] = useState('HEX');
  const [chatHistories, setChatHistories] = useState({});
  const [notes, setNotes] = useState([]);
  const [gamePhase, setGamePhase] = useState('intro'); // intro, investigation, accusation, verdict
  const [gameSession, setGameSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNotebook, setShowNotebook] = useState(false);
  const [showAccusation, setShowAccusation] = useState(false);

  // Initialize game on component mount
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if we have an existing session
      let sessionId = apiService.getSessionId();
      
      if (sessionId) {
        // Try to get existing session
        try {
          const sessionResponse = await apiService.getSessionInfo();
          if (sessionResponse.success) {
            setGameSession(sessionResponse.session);
            
            // Load chat histories for all agents
            const histories = {};
            for (const agent of agents) {
              try {
                const chatResponse = await apiService.getChatHistory(agent.id);
                if (chatResponse.success) {
                  histories[agent.id] = chatResponse.chatHistory;
                }
              } catch (error) {
                console.error(`Error loading chat for ${agent.id}:`, error);
                histories[agent.id] = [];
              }
            }
            setChatHistories(histories);
            
            if (sessionResponse.session.gamePhase !== 'investigation') {
              setGamePhase(sessionResponse.session.gamePhase);
            } else {
              setGamePhase('investigation');
            }
            
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.log('Session not found or expired, creating new game');
          // Clear invalid session ID
          apiService.clearSession();
        }
      }
      
      // Create new game session
      const response = await apiService.createNewGame();
      if (response.success) {
        setGameSession({
          id: response.sessionId,
          gamePhase: response.gamePhase,
          questionCounts: response.questionCounts,
          remainingQuestions: response.remainingQuestions
        });
        
        // Initialize empty chat histories
        const initialChats = {};
        agents.forEach(agent => {
          initialChats[agent.id] = [];
        });
        setChatHistories(initialChats);
        
        setGamePhase('intro');
      } else {
        throw new Error('Failed to create game session');
      }
    } catch (error) {
      console.error('Error initializing game:', error);
      setError(`Failed to initialize game: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const startInvestigation = () => {
    setGamePhase('investigation');
  };

  const addNote = (note) => {
    const newNote = {
      id: Date.now(),
      content: note,
      timestamp: new Date().toLocaleTimeString(),
      agent: selectedAgent
    };
    setNotes([...notes, newNote]);
  };

  const removeNote = (noteId) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };

  const updateChatHistory = (agentId, message, sender) => {
    setChatHistories(prev => ({
      ...prev,
      [agentId]: [...prev[agentId], { message, sender, timestamp: new Date().toLocaleTimeString() }]
    }));
  };

  const makeAccusation = async (accusedId) => {
    setIsLoading(true);
    try {
      const response = await apiService.makeAccusation(accusedId);
      if (response.success) {
        setGamePhase('verdict');
        setGameSession(prev => ({
          ...prev,
          gamePhase: 'verdict',
          accusation: response.accusation
        }));
        // Keep the accusation panel open to show the verdict
      } else {
        throw new Error('Failed to process accusation');
      }
    } catch (error) {
      console.error('Error making accusation:', error);
      setError(`Failed to make accusation: ${error.message}`);
      setShowAccusation(false); // Only close on error
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading && !gameSession) {
    return (
      <div className="w-full h-screen flex items-center justify-center" style={{ backgroundColor: '#081421' }}>
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-t-transparent rounded-full mx-auto" style={{ borderColor: '#00d9c0' }}></div>
          <p className="text-lg" style={{ color: '#a2c2cb' }}>Initializing Turing Station...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center" style={{ backgroundColor: '#081421' }}>
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl">⚠️</div>
          <h3 className="text-xl font-bold text-white">Connection Error</h3>
          <p className="text-lg" style={{ color: '#a2c2cb' }}>
            {error}
          </p>
          <button 
            onClick={() => {
              setError(null);
              initializeGame();
            }}
            className="px-6 py-3 rounded-lg font-semibold text-white"
            style={{ backgroundColor: '#00d9c0' }}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (gamePhase === 'intro') {
    return (
      <div className="w-full h-screen" style={{ backgroundColor: '#081421' }}>
        <div className="h-full grid grid-cols-1 lg:grid-cols-2">
          {/* Left Side - Logo & CTA */}
          <div className="flex flex-col justify-center items-center p-8" style={{ 
            background: 'linear-gradient(135deg, #081421 0%, #0a1a2e 50%, #081421 100%)' 
          }}>
            <div className="text-center space-y-8">
              <div className="space-y-6">
                <img 
                  src="/logoturing-removebg-preview.png" 
                  alt="Turing Station Logo" 
                  className="w-64 lg:w-80 h-auto mx-auto"
                />
                <h2 className="text-2xl lg:text-3xl font-light" style={{ color: '#a2c2cb' }}>
                  An AI Whodunit
                </h2>
              </div>
              
              <div className="space-y-4">
                <p className="text-lg max-w-md" style={{ color: '#a2c2cb' }}>
                  Five AIs. One murder. Only you can uncover the truth.
                </p>
                
                <button 
                  onClick={startInvestigation}
                  className="px-8 py-4 rounded-lg text-xl font-semibold transition-all transform hover:scale-105 shadow-lg text-white"
                  style={{ 
                    backgroundColor: '#00d9c0',
                    boxShadow: '0 4px 20px rgba(0, 217, 192, 0.3)'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#00c5b0'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#00d9c0'}
                >
                  Begin Investigation 🔍
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Story */}
          <div className="flex flex-col justify-center p-8 lg:p-12" style={{ backgroundColor: '#0a1a2e' }}>
            <div className="max-w-xl space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">The Mystery</h3>
                <div className="space-y-3" style={{ color: '#a2c2cb' }}>
                  <p className="text-lg">
                    You are the sole human left on <strong className="text-white">Turing Station</strong>, orbiting a desolate planet.
                  </p>
                  <p className="text-lg">
                    Your colleague, <strong style={{ color: '#ff4e6d' }}>Dr. Rao</strong>, has been found dead.
                  </p>
                  
                  {/* Murder Details */}
                  {gameSession?.murderScenario && (
                    <div className="p-4 rounded-lg mt-4" style={{
                      backgroundColor: 'rgba(255, 78, 109, 0.05)',
                      border: '1px solid rgba(255, 78, 109, 0.2)'
                    }}>
                      <h4 className="font-bold mb-2" style={{ color: '#ff4e6d' }}>Crime Scene Report:</h4>
                      <p className="text-sm" style={{ color: '#a2c2cb' }}>
                        <strong>Method:</strong> {gameSession.murderScenario.method}
                      </p>
                      <p className="text-sm mt-2" style={{ color: '#a2c2cb' }}>
                        {gameSession.murderScenario.details}
                      </p>
                    </div>
                  )}
                  
                  <p className="text-lg">
                    The only other beings onboard are five advanced AI agents:
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {agents.map(agent => (
                  <div key={agent.id} className="flex items-center p-3 rounded-lg transition-colors" style={{
                    backgroundColor: 'rgba(10, 26, 46, 0.5)',
                    border: '1px solid rgba(0, 217, 192, 0.2)'
                  }}>
                    <img 
                      src={agent.logo} 
                      alt={`${agent.name} Logo`} 
                      className="w-8 h-8 mr-3 object-contain"
                    />
                    <div>
                      <strong style={{ color: '#00d9c0' }}>{agent.name}</strong>
                      <span className="text-sm block" style={{ color: '#a2c2cb' }}>{agent.system}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 rounded-lg" style={{
                backgroundColor: 'rgba(255, 78, 109, 0.1)',
                border: '1px solid rgba(255, 78, 109, 0.3)'
              }}>
                <p className="font-semibold text-center" style={{ color: '#ff4e6d' }}>
                  One of them is the killer.
                </p>
                <p className="text-center mt-2" style={{ color: '#a2c2cb' }}>
                  Interrogate each AI, gather clues, and make your accusation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen text-white flex flex-col" style={{ backgroundColor: '#081421' }}>
      {/* Header */}
      <div className="border-b p-4 flex-shrink-0" style={{ 
        backgroundColor: '#0a1a2e',
        borderBottomColor: '#00d9c0'
      }}>
        <div className="w-full px-6 flex items-center justify-between min-h-[60px]">
          <div className="flex items-center space-x-4 flex-shrink-0">
            <img 
              src="/logoturing-removebg-preview.png" 
              alt="Turing Station Logo" 
              className="h-8 md:h-10 w-auto"
            />
            <h1 className="text-lg md:text-xl font-bold text-white">Investigation</h1>
          </div>
          <div className="flex gap-2 md:gap-4 flex-shrink-0">
            <button 
              onClick={() => setShowNotebook(!showNotebook)}
              className={`px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base ${
                showNotebook 
                  ? 'text-white' 
                  : 'text-white hover:opacity-80'
              }`}
              style={{ 
                backgroundColor: showNotebook ? '#8fffa4' : '#00d9c0'
              }}
            >
              📝 <span className="hidden sm:inline">Notebook</span> ({notes.length})
            </button>
            <button 
              onClick={() => setShowAccusation(!showAccusation)}
              className="text-white px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base hover:opacity-80"
              style={{ backgroundColor: '#ff4e6d' }}
            >
              ⚖️ <span className="hidden sm:inline">Accuse</span>
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-6 py-4 flex-1" style={{ backgroundColor: '#081421' }}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* AI Selector */}
          <div className="lg:col-span-1 h-full">
            <AISelector 
              agents={agents}
              selectedAgent={selectedAgent}
              onSelectAgent={setSelectedAgent}
              chatHistories={chatHistories}
              gameSession={gameSession}
            />
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 h-full">
            <AgentChat 
              agentId={selectedAgent}
              chatHistory={chatHistories[selectedAgent] || []}
              onUpdateHistory={updateChatHistory}
              onAddNote={addNote}
            />
          </div>

          {/* Side Panel */}
          <div className="lg:col-span-1 h-full">
            {showNotebook && (
              <Notebook 
                notes={notes}
                onRemoveNote={removeNote}
                onClose={() => setShowNotebook(false)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Accusation Modal */}
      {(showAccusation || gamePhase === 'verdict') && (
        <AccusationPanel 
          agents={agents}
          onAccuse={makeAccusation}
          onClose={() => {
            setShowAccusation(false);
            if (gamePhase === 'verdict') {
              // Reset the entire game state for a new session
              setGamePhase('intro');
              setGameSession(null);
              setChatHistories({});
              setNotes([]);
              setSelectedAgent('HEX');
              apiService.clearSession();
              // Initialize a new game
              initializeGame();
            }
          }}
          onNewGame={() => {
            // Reset everything for a completely new game
            setShowAccusation(false);
            setGamePhase('intro');
            setGameSession(null);
            setChatHistories({});
            setNotes([]);
            setSelectedAgent('HEX');
            apiService.clearSession();
            initializeGame();
          }}
          gameSession={gameSession}
          gamePhase={gamePhase}
        />
      )}
    </div>
  );
}

export default Game;
