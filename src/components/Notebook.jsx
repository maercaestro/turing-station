function Notebook({ notes, onRemoveNote, onClose }) {
  return (
    <div className="rounded-xl p-6 h-full flex flex-col" style={{ backgroundColor: '#0a1a2e' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ color: '#00d9c0' }}>📝 Investigation Notes</h2>
        <button 
          onClick={onClose}
          className="text-xl hover:opacity-70 transition-opacity"
          style={{ color: '#a2c2cb' }}
        >
          ✕
        </button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar" style={{
        maxHeight: 'calc(100vh - 400px)'
      }}>
        {notes.length === 0 ? (
          <div className="text-center mt-8" style={{ color: '#a2c2cb' }}>
            <p>No notes yet.</p>
            <p className="text-sm mt-2">Click the 📝 button on AI messages to add them to your notebook.</p>
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="p-3 rounded-lg relative group" style={{ backgroundColor: '#081421' }}>
              <div className="text-sm text-white mb-2">{note.content}</div>
              <div className="flex items-center justify-between text-xs" style={{ color: '#a2c2cb' }}>
                <span>From: {note.agent}</span>
                <span>{note.timestamp}</span>
              </div>
              <button
                onClick={() => onRemoveNote(note.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-70"
                style={{ color: '#ff4e6d' }}
                title="Delete note"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {notes.length > 0 && (
        <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#081421' }}>
          <h3 className="font-semibold mb-2" style={{ color: '#00d9c0' }}>📊 Summary</h3>
          <div className="text-sm text-white">
            <p>Total notes: {notes.length}</p>
            <div className="mt-2">
              <p>Notes per agent:</p>
              {['ORBITA', 'ARIS', 'HEX', 'LUMA', 'DAEL'].map(agentId => {
                const count = notes.filter(note => note.agent === agentId).length;
                if (count > 0) {
                  return (
                    <div key={agentId} className="text-xs ml-2" style={{ color: '#a2c2cb' }}>
                      {agentId}: {count}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#081421' }}>
        <h3 className="font-semibold mb-2" style={{ color: '#00d9c0' }}>💡 Detective Tips</h3>
        <ul className="text-xs space-y-1" style={{ color: '#a2c2cb' }}>
          <li>• Look for contradictions between agents</li>
          <li>• Note who has alibis and who doesn't</li>
          <li>• Pay attention to suspicious behavior</li>
          <li>• Consider who had means and opportunity</li>
        </ul>
      </div>
    </div>
  );
}

export default Notebook;
