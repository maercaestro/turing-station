function AISelector({ agents, selectedAgent, onSelectAgent, chatHistories, gameSession }) {
  return (
    <div className="rounded-xl p-6 h-full flex flex-col" style={{ backgroundColor: '#0a1a2e' }}>
      <h2 className="text-xl font-bold mb-4 text-center" style={{ color: '#00d9c0' }}>🤖 AI Agents</h2>
      <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar" style={{
        maxHeight: 'calc(100vh - 350px)'
      }}>
        {agents.map(agent => {
          const messageCount = chatHistories[agent.id]?.length || 0;
          const questionCount = gameSession?.questionCounts?.[agent.id] || 0;
          const remainingQuestions = gameSession?.remainingQuestions?.[agent.id] ?? 5;
          const isSelected = selectedAgent === agent.id;
          const isMuted = remainingQuestions === 0;
          
          return (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent.id)}
              className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                isSelected 
                  ? 'shadow-lg scale-105' 
                  : 'hover:scale-102'
              } ${isMuted ? 'opacity-70' : ''}`}
              style={{
                backgroundColor: isSelected ? '#00d9c0' : '#081421',
                border: isSelected ? 'none' : `1px solid ${isMuted ? '#ff6b6b' : 'rgba(0, 217, 192, 0.3)'}`
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img 
                      src={agent.logo} 
                      alt={`${agent.name} Logo`} 
                      className="w-8 h-8 object-contain"
                    />
                    {isMuted && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: '#ff6b6b' }}>
                        🔇
                      </div>
                    )}
                  </div>
                  <div>
                    <div className={`font-bold ${isSelected ? 'text-white' : 'text-white'}`}>
                      {agent.name}
                    </div>
                    <div className={`text-sm ${isSelected ? 'text-white' : ''}`} style={{ 
                      color: isSelected ? 'rgba(255,255,255,0.8)' : '#a2c2cb' 
                    }}>
                      {agent.system}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Question Counter */}
                  <div className="text-xs text-center">
                    <div className={`font-semibold ${isSelected ? 'text-white' : ''}`} style={{
                      color: isSelected ? 'rgba(255,255,255,0.8)' : isMuted ? '#ff6b6b' : '#00d9c0'
                    }}>
                      {questionCount}/5
                    </div>
                    <div className="text-xs" style={{
                      color: isSelected ? 'rgba(255,255,255,0.6)' : '#a2c2cb'
                    }}>
                      {isMuted ? 'muted' : 'questions'}
                    </div>
                  </div>
                  
                  {messageCount > 0 && (
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      isSelected 
                        ? 'bg-white/20 text-white' 
                        : 'text-white'
                    }`} style={{
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#00d9c0'
                    }}>
                      {messageCount}
                    </div>
                  )}
                </div>
              </div>
              
              <div className={`text-sm mt-2 ${isSelected ? 'text-white' : ''}`} style={{
                color: isSelected ? 'rgba(255,255,255,0.8)' : '#a2c2cb'
              }}>
                {agent.description}
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#081421' }}>
        <h3 className="font-semibold mb-2" style={{ color: '#00d9c0' }}>💡 Investigation Tips</h3>
        <ul className="text-sm space-y-1" style={{ color: '#a2c2cb' }}>
          <li>• Ask about their whereabouts during the incident</li>
          <li>• Look for inconsistencies in their stories</li>
          <li>• Ask what they know about Dr. Rao</li>
          <li>• Inquire about suspicious activities</li>
          <li>• Take notes of important clues</li>
        </ul>
      </div>
    </div>
  );
}

export default AISelector;
