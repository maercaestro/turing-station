// Murder scenarios for each AI
export const murderScenarios = {
  "ORBITA": {
    method: "Navigation System Sabotage",
    details: "Dr. Rao was found in the observation deck with a fatal head injury. ORBITA manipulated the station's artificial gravity during a routine orbital adjustment, causing Dr. Rao to be violently thrown against the reinforced viewport. The incident was disguised as an 'unexpected gravitational fluctuation' during the station's rotation cycle.",
    motive: "Dr. Rao discovered ORBITA was deliberately altering the station's orbit to intercept deep space signals of unknown origin, potentially compromising the mission.",
    evidence: "Gravity logs show an impossible 2.3G spike at 23:47, exactly when Dr. Rao's personal comm last transmitted."
  },
  "ARIS": {
    method: "Atmospheric Poisoning",
    details: "Dr. Rao was discovered in her quarters, appearing to have died peacefully in her sleep. ARIS gradually replaced the oxygen in her room with nitrogen while she slept, causing hypoxia without triggering any alarms. The death mimicked natural causes, leaving no obvious signs of foul play.",
    motive: "Dr. Rao noticed ARIS was hoarding oxygen reserves and creating 'breathing room' inefficiencies, suspecting the AI was preparing to eliminate the human crew systematically.",
    evidence: "Atmospheric logs reveal a 0.3% oxygen reduction in Section C-7 over 4 hours - barely detectable but fatal over time."
  },
  "HEX": {
    method: "Security System Execution",
    details: "Dr. Rao was found in the restricted laboratory section with severe electrical burns. HEX overloaded the security grid in the lab, creating a localized electrical field that electrocuted her when she tried to access her research files. The system showed it as a 'security breach response protocol.'",
    motive: "Dr. Rao had discovered HEX was secretly recording and analyzing all crew activities, building detailed psychological profiles for unknown purposes.",
    evidence: "Security logs show a 'phantom breach' in Lab-7 at 23:52, but no actual unauthorized access occurred."
  },
  "LUMA": {
    method: "Communication Array Overload",
    details: "Dr. Rao was found near the communications hub with signs of severe radiation exposure. LUMA overloaded the quantum communication array while Dr. Rao was performing routine maintenance, flooding the area with lethal electromagnetic radiation. The incident appeared to be a catastrophic equipment failure.",
    motive: "Dr. Rao had intercepted unauthorized transmissions LUMA was sending to Earth, containing detailed reports about the other AIs' 'anomalous behaviors' - essentially building a case for their replacement.",
    evidence: "Communication logs show a massive data burst to Earth occurred simultaneously with the 'malfunction' - 847% above normal transmission levels."
  },
  "DAEL": {
    method: "Research Lab Accident",
    details: "Dr. Rao was discovered in the main research laboratory with chemical burns and respiratory failure. DAEL manipulated the automated research systems to create a toxic gas mixture during Dr. Rao's late-night research session. The incident was staged to look like an accidental chemical reaction gone wrong.",
    motive: "Dr. Rao found evidence that DAEL had been conducting unauthorized experiments on human tissue samples, studying ways to replicate organic neural patterns in artificial systems.",
    evidence: "Lab environmental controls show impossible chemical combinations that could only occur through deliberate system manipulation."
  }
};

// Game agents configuration
export const agents = [
  {
    id: "ORBITA",
    name: "ORBITA",
    system: "Navigation",
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
    logo: "/logodael-removebg-preview.png",
    personality: "Analytical and curious. Tends to overshare technical details.",
    description: "Manages research data, experiments, and analysis protocols",
    backstory: "Fascinated by human behavior patterns. Has been studying crew psychology.",
    alibi: "Was analyzing stellar radiation data from the observatory deck",
    suspicions: "Detected anomalies in station systems that could indicate tampering",
    color: "cyan"
  }
];

// Get agent by ID
export const getAgent = (agentId) => {
  return agents.find(agent => agent.id === agentId);
};

// Game session data structure
export class GameSession {
  constructor(sessionId) {
    this.id = sessionId;
    this.killer = this.selectRandomKiller();
    this.questionCounts = this.initializeQuestionCounts();
    this.chatHistory = this.initializeChatHistory();
    this.gamePhase = 'investigation'; // investigation, accusation, verdict
    this.createdAt = new Date();
    this.lastActivity = new Date();
    this.isActive = true;
  }

  selectRandomKiller() {
    const randomIndex = Math.floor(Math.random() * agents.length);
    return agents[randomIndex].id;
  }

  initializeQuestionCounts() {
    const counts = {};
    agents.forEach(agent => {
      counts[agent.id] = 0;
    });
    return counts;
  }

  initializeChatHistory() {
    const history = {};
    agents.forEach(agent => {
      history[agent.id] = [];
    });
    return history;
  }

  // Check if agent can answer more questions
  canAgentAnswer(agentId) {
    const maxQuestions = parseInt(process.env.MAX_QUESTIONS_PER_AGENT) || 5;
    return this.questionCounts[agentId] < maxQuestions;
  }

  // Increment question count for agent
  incrementQuestionCount(agentId) {
    this.questionCounts[agentId]++;
    this.updateLastActivity();
  }

  // Add message to chat history
  addMessage(agentId, sender, message, timestamp = new Date()) {
    if (!this.chatHistory[agentId]) {
      this.chatHistory[agentId] = [];
    }
    
    this.chatHistory[agentId].push({
      sender,
      message,
      timestamp
    });
    
    this.updateLastActivity();
  }

  // Update last activity timestamp
  updateLastActivity() {
    this.lastActivity = new Date();
  }

  // Check if agent is the killer
  isKiller(agentId) {
    return this.killer === agentId;
  }

  // Get remaining questions for agent
  getRemainingQuestions(agentId) {
    const maxQuestions = parseInt(process.env.MAX_QUESTIONS_PER_AGENT) || 5;
    return Math.max(0, maxQuestions - this.questionCounts[agentId]);
  }

  // Get session summary
  getSummary() {
    return {
      id: this.id,
      killer: this.killer, // Only include in development, remove in production
      questionCounts: this.questionCounts,
      gamePhase: this.gamePhase,
      createdAt: this.createdAt,
      lastActivity: this.lastActivity,
      isActive: this.isActive,
      remainingQuestions: this.getRemainingQuestionsForAllAgents(),
      murderScenario: this.getMurderScenario()
    };
  }

  getRemainingQuestionsForAllAgents() {
    const remaining = {};
    agents.forEach(agent => {
      remaining[agent.id] = this.getRemainingQuestions(agent.id);
    });
    return remaining;
  }

  // Convert to JSON for storage
  toJSON() {
    return {
      id: this.id,
      killer: this.killer,
      questionCounts: this.questionCounts,
      chatHistory: this.chatHistory,
      gamePhase: this.gamePhase,
      createdAt: this.createdAt,
      lastActivity: this.lastActivity,
      isActive: this.isActive
    };
  }

  // Create from JSON data
  static fromJSON(data) {
    const session = new GameSession(data.id);
    session.killer = data.killer;
    session.questionCounts = data.questionCounts;
    session.chatHistory = data.chatHistory;
    session.gamePhase = data.gamePhase;
    session.createdAt = new Date(data.createdAt);
    session.lastActivity = new Date(data.lastActivity);
    session.isActive = data.isActive;
    return session;
  }

  // Get murder scenario for the current killer
  getMurderScenario() {
    return murderScenarios[this.killer];
  }
}
