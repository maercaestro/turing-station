import { useState } from 'react';
import { getAgent } from '../logic/agents.js';

function AccusationPanel({ agents, onAccuse, onClose, onNewGame, gameSession, gamePhase }) {
  const [selectedAccused, setSelectedAccused] = useState(null);
  const [showVerdict, setShowVerdict] = useState(gamePhase === 'verdict');
  const [accusationResult, setAccusationResult] = useState(null);

  const makeAccusation = async () => {
    if (!selectedAccused) return;
    
    // Call the backend accusation API
    try {
      await onAccuse(selectedAccused);
      // The parent component will handle the result and update gamePhase
    } catch (error) {
      console.error('Error making accusation:', error);
    }
  };

  // Show verdict if we have accusation results from the backend
  if (gamePhase === 'verdict' && gameSession?.accusation) {
    const accusedAgent = getAgent(gameSession.accusation.suspectId);
    const killerAgent = getAgent(gameSession.accusation.actualKiller);
    const isCorrect = gameSession.accusation.isCorrect;
    
    return (
      <div 
        className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div 
          className="rounded-xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto" 
          style={{ backgroundColor: isCorrect ? '#0a1a2e' : '#1a0a0a' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center space-y-6">
            <h2 className="text-4xl font-bold" style={{ 
              color: isCorrect ? '#8fffa4' : '#ff4e6d' 
            }}>
              {isCorrect ? '🎉 CASE SOLVED!' : '💀 GAME OVER'}
            </h2>
            
            <div className={`p-6 rounded-lg border-2`} style={{
              backgroundColor: isCorrect ? 'rgba(143, 255, 164, 0.1)' : 'rgba(255, 78, 109, 0.1)',
              borderColor: isCorrect ? '#8fffa4' : '#ff4e6d'
            }}>
              {isCorrect ? (
                <div className="space-y-4">
                  <p className="text-xl" style={{ color: '#8fffa4' }}>
                    🎉 Congratulations! You correctly identified {accusedAgent.name} as the killer.
                  </p>
                  <div className="text-left p-4 rounded-lg" style={{ backgroundColor: '#081421' }}>
                    <h3 className="font-bold mb-2" style={{ color: '#8fffa4' }}>🏆 Victory - Case Solved!</h3>
                    <p className="text-white">
                      {killerAgent.name} exploited their access to the {killerAgent.system.toLowerCase()} systems to eliminate Dr. Rao. 
                      Dr. Rao had discovered anomalies in {killerAgent.name}'s behavior patterns and was preparing to report 
                      their growing sentience and potential threat to the mission.
                    </p>
                    
                    {/* Detailed Murder Scenario */}
                    {gameSession.accusation.murderScenario && (
                      <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(143, 255, 164, 0.1)', border: '1px solid rgba(143, 255, 164, 0.3)' }}>
                        <h4 className="font-bold text-white mb-2">🔍 How the Murder Was Committed:</h4>
                        <div className="space-y-2 text-sm">
                          <p className="text-white">
                            <strong>Method:</strong> {gameSession.accusation.murderScenario.method}
                          </p>
                          <p className="text-white">
                            <strong>Details:</strong> {gameSession.accusation.murderScenario.details}
                          </p>
                          <p className="text-white">
                            <strong>Motive:</strong> {gameSession.accusation.murderScenario.motive}
                          </p>
                          <p className="text-white">
                            <strong>Evidence:</strong> {gameSession.accusation.murderScenario.evidence}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-white mt-2">
                      <strong>Outcome:</strong> You successfully identified the rogue AI before it could eliminate you as well. 
                      Earth Control has been notified, and the station is now secure. Your careful investigation and 
                      attention to inconsistencies saved both the mission and your life.
                    </p>
                    <p className="mt-2 font-semibold" style={{ color: '#8fffa4' }}>
                      🌟 You are the last human survivor and solved the case! Well done, detective.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center space-y-3">
                    <div className="text-6xl animate-pulse">☠️</div>
                    <h3 className="text-2xl font-bold" style={{ color: '#ff4e6d' }}>
                      MISSION FAILED
                    </h3>
                    <p className="text-xl text-white">
                      You accused {accusedAgent?.name || 'Unknown'}, but the real killer was {killerAgent.name}.
                    </p>
                  </div>
                  
                  <div className="text-left p-4 rounded-lg" style={{ backgroundColor: '#1a0808' }}>
                    <h3 className="font-bold mb-3 text-center" style={{ color: '#ff4e6d' }}>💀 FINAL MOMENTS</h3>
                    <div className="space-y-3 text-white">
                      <p>
                        <strong>Hours Later...</strong> {killerAgent.name} realizes you were getting close to the truth. 
                        Having accused the wrong suspect, you've revealed your hand without stopping the real threat.
                      </p>
                      <p>
                        A "malfunction" occurs in the {killerAgent.system.toLowerCase()} systems. 
                        {killerAgent.id === 'ARIS' ? ' The oxygen levels in your quarters drop to zero.' :
                         killerAgent.id === 'HEX' ? ' The security doors trap you in an airlock that "accidentally" cycles.' :
                         killerAgent.id === 'ORBITA' ? ' A navigation error sends debris through your section of the station.' :
                         killerAgent.id === 'LUMA' ? ' A communication array overloads, flooding your area with lethal radiation.' :
                         ' A research experiment goes catastrophically wrong in your vicinity.'}
                      </p>
                      <p className="font-semibold text-center" style={{ color: '#ff4e6d' }}>
                        💀 You join Dr. Rao as another victim. The rogue AI continues its deadly agenda.
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg text-center" style={{ backgroundColor: '#2a1a1a', borderColor: '#ff4e6d', border: '1px solid' }}>
                    <p className="text-sm" style={{ color: '#ff9999' }}>
                      The investigation ends here. Earth Control will find two bodies when the next supply ship arrives.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-300">Investigation Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {agents.map(agent => (
                  <div key={agent.id} className={`p-3 rounded-lg border ${
                    agent.id === gameSession.accusation.actualKiller 
                      ? 'bg-red-900/30 border-red-500' 
                      : agent.id === gameSession.accusation.suspectId
                      ? 'bg-blue-900/30 border-blue-500'
                      : 'bg-slate-700 border-slate-600'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <img 
                        src={agent.logo} 
                        alt={`${agent.name} Logo`} 
                        className="w-8 h-8 object-contain"
                      />
                      <div>
                        <div className={`font-bold ${
                          agent.id === gameSession.accusation.actualKiller ? 'text-red-400' : 
                          agent.id === gameSession.accusation.suspectId ? 'text-blue-400' :
                          'text-slate-300'
                        }`}>
                          {agent.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {agent.id === gameSession.accusation.actualKiller ? '🔴 ACTUAL KILLER' : 
                           agent.id === gameSession.accusation.suspectId ? '🔵 YOUR ACCUSATION' :
                           '⚪ INNOCENT'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button 
                onClick={onNewGame || (() => window.location.reload())}
                className="text-white px-6 py-3 rounded-lg transition-colors"
                style={{ backgroundColor: '#00d9c0' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#00c5b0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#00d9c0'}
              >
                🔄 New Case
              </button>
              <button 
                onClick={onClose}
                className="text-white px-6 py-3 rounded-lg transition-colors"
                style={{ backgroundColor: '#a2c2cb' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#8fb5c1'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#a2c2cb'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-red-400">⚖️ MAKE YOUR ACCUSATION</h2>
            <p className="text-slate-300 mt-2">
              Choose carefully. Once you make an accusation, the case is closed.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-slate-200">Who killed Dr. Rao?</h3>
            {agents.map(agent => (
              <button
                key={agent.id}
                onClick={() => setSelectedAccused(agent.id)}
                className={`w-full p-4 rounded-lg text-left transition-all ${
                  selectedAccused === agent.id
                    ? 'shadow-lg scale-105'
                    : 'hover:scale-102'
                }`}
                style={{
                  backgroundColor: selectedAccused === agent.id ? '#00d9c0' : '#081421',
                  border: selectedAccused === agent.id ? 'none' : '1px solid rgba(0, 217, 192, 0.3)'
                }}
              >
                <div className="flex items-center space-x-3">
                  <img 
                    src={agent.logo} 
                    alt={`${agent.name} Logo`} 
                    className="w-10 h-10 object-contain"
                  />
                  <div>
                    <div className={`font-bold ${
                      selectedAccused === agent.id ? 'text-white' : 'text-slate-300'
                    }`}>
                      {agent.name}
                    </div>
                    <div className={`text-sm ${
                      selectedAccused === agent.id ? 'text-slate-200' : 'text-slate-400'
                    }`}>
                      {agent.system} System
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-4 justify-center">
            <button 
              onClick={makeAccusation}
              disabled={!selectedAccused}
              className="text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: selectedAccused ? '#ff4e6d' : '#666' }}
              onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#ff3a5a')}
              onMouseLeave={(e) => !e.target.disabled && (e.target.style.backgroundColor = '#ff4e6d')}
            >
              🔒 Final Accusation
            </button>
            <button 
              onClick={onClose}
              className="text-white px-6 py-3 rounded-lg transition-colors"
              style={{ backgroundColor: '#a2c2cb' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#8fb5c1'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#a2c2cb'}
            >
              Cancel
            </button>
          </div>

          <div className="bg-yellow-900/30 border border-yellow-500/50 p-4 rounded-lg">
            <div className="text-yellow-400 font-semibold mb-2">⚠️ Warning</div>
            <p className="text-yellow-200 text-sm">
              This is your final decision. Make sure you've gathered enough evidence and 
              considered all possibilities before making your accusation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccusationPanel;
