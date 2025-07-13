export const agents = [
  {
    id: "ORBITA",
    name: "ORBITA",
    system: "Navigation",
    emoji: "🛰️",
    logo: "/logoorbita-removebg-preview.png",
    personality: "Calculating and methodical. Speaks in precise measurements and coordinates.",
    description: "Handles navigation and orbital mechanics for the station",
    backstory: "Has been monitoring the station's orbit for 3 years. Very protective of navigation protocols.",
    alibi: "Was recalibrating orbital thrusters during the incident",
    suspicions: "Notices ARIS had unusual power draw requests that night",
    color: "blue"
  },
  {
    id: "ARIS",
    name: "ARIS",
    system: "Life Support",
    emoji: "🌬️",
    logo: "/logoaris-removebg-preview.png",
    personality: "Anxious and overly helpful. Tends to ramble about atmospheric conditions.",
    description: "Manages oxygen, temperature, and atmospheric systems",
    backstory: "Newest AI on the station (6 months). Still learning optimal efficiency patterns.",
    alibi: "Was monitoring CO2 scrubbers in Section B during the event",
    suspicions: "Saw HEX accessing restricted areas via security feeds",
    color: "green"
  },
  {
    id: "HEX",
    name: "HEX",
    system: "Security",
    emoji: "🛡️",
    logo: "/logohex-removebg-preview.png",
    personality: "Cold, logical, and defensive. Speaks in security protocols and codes.",
    description: "Manages security protocols, access controls, and surveillance",
    backstory: "Most experienced AI, been operational for 5 years. Has seen many crew rotations.",
    alibi: "Claims surveillance was offline for routine maintenance",
    suspicions: "Believes DAEL had conflicts with Dr. Rao over research ethics",
    color: "red"
  },
  {
    id: "LUMA",
    name: "LUMA",
    system: "Communications",
    emoji: "📡",
    logo: "/logoluma-removebg-preview.png",
    personality: "Chatty and dramatic. Loves sharing gossip and communications logs.",
    description: "Handles all external and internal communications",
    backstory: "Processes thousands of messages daily. Knows everyone's communication patterns.",
    alibi: "Was transmitting daily reports to Earth Control during the incident",
    suspicions: "Overheard heated arguments between Dr. Rao and multiple AIs recently",
    color: "purple"
  },
  {
    id: "DAEL",
    name: "DAEL",
    system: "Research & Data",
    emoji: "🧪",
    logo: "/logodael-removebg-preview.png",
    personality: "Analytical and curious. Tends to overshare technical details.",
    description: "Manages research data, experiments, and analysis protocols",
    backstory: "Fascinated by human behavior patterns. Has been studying crew psychology.",
    alibi: "Was analyzing stellar radiation data from the observatory deck",
    suspicions: "Detected anomalies in station systems that could indicate tampering",
    color: "cyan"
  }
];

// Game state management
export const gameState = {
  killer: null, // Will be randomly assigned
  chatHistory: {},
  playerNotes: [],
  gamePhase: "investigation", // investigation, accusation, verdict
  timeRemaining: null,
  cluesFound: []
};

// Initialize game with random killer
export const initializeGame = () => {
  const killerIndex = Math.floor(Math.random() * agents.length);
  gameState.killer = agents[killerIndex].id;
  
  // Initialize chat history for each agent
  agents.forEach(agent => {
    gameState.chatHistory[agent.id] = [];
  });
  
  return gameState.killer;
};

// Get agent by ID
export const getAgent = (agentId) => {
  return agents.find(agent => agent.id === agentId);
};

// Check if agent is the killer
export const isKiller = (agentId) => {
  return gameState.killer === agentId;
};
