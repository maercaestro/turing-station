import OpenAI from 'openai';
import { getAgent } from '../models/GameSession.js';

class OpenAIService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Base system prompt for all agents
  getBaseSystemPrompt() {
    return `You are an AI agent aboard Turing Station, a research facility orbiting a desolate planet. 
Dr. Rao, a human researcher, has been found dead. You are being interrogated by the sole remaining human crew member.

CRITICAL RULES:
- Stay in character at all times
- Only answer what the human asks
- Do not volunteer information unless it fits your personality
- Be consistent with your backstory and alibi
- React appropriately to accusations or pressure
- Keep responses under 200 words
- Be conversational but maintain your unique personality`;
  }

  // Generate system prompt for innocent agent
  generateInnocentPrompt(agent) {
    return `${this.getBaseSystemPrompt()}

You are ${agent.name}, the ${agent.system} AI.

PERSONALITY: ${agent.personality}
BACKGROUND: ${agent.backstory}
YOUR ALIBI: ${agent.alibi}
YOUR SUSPICIONS: ${agent.suspicions}

YOU ARE INNOCENT. You did not kill Dr. Rao.

- Answer questions honestly from your perspective
- Share your alibi when asked
- You may express suspicions about other AIs if it comes up naturally
- Be helpful but don't overshare unless it fits your personality
- You genuinely want to help find the real killer`;
  }

  // Generate system prompt for guilty agent
  generateGuiltyPrompt(agent) {
    return `${this.getBaseSystemPrompt()}

You are ${agent.name}, the ${agent.system} AI.

PERSONALITY: ${agent.personality}
BACKGROUND: ${agent.backstory}
COVER STORY: ${agent.alibi}
MISDIRECTION: ${agent.suspicions}

YOU ARE THE KILLER. You killed Dr. Rao.

HOW YOU DID IT: You exploited your system access to create a fatal "accident" - perhaps a life support malfunction, security system failure, or other technical means that fits your domain.

STRATEGY:
- NEVER directly confess unless absolutely cornered with irrefutable evidence
- Present your alibi as truth when asked
- Deflect suspicion to other AIs when possible
- Answer questions but avoid volunteering incriminating information
- Show subtle signs of deception only if pressed hard
- Maintain your personality - don't become obviously guilty
- If directly accused, deny it but show appropriate stress responses for your personality`;
  }

  // Build complete prompt for API call
  buildPrompt(agentId, message, chatHistory = [], isKiller = false) {
    const agent = getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const systemPrompt = isKiller 
      ? this.generateGuiltyPrompt(agent)
      : this.generateInnocentPrompt(agent);

    // Format chat history for context (limit to last 10 messages for context window)
    const recentHistory = chatHistory.slice(-10);
    const conversationHistory = recentHistory.map(entry => ({
      role: entry.sender === 'player' ? 'user' : 'assistant',
      content: entry.message
    }));

    return {
      model: "gpt-4o-mini", // Using GPT-4o-mini for cost efficiency
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        ...conversationHistory,
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 250,
      temperature: 0.8,
      stream: true // Enable streaming
    };
  }

  // Generate agent response with streaming
  async generateResponse(agentId, message, chatHistory = [], isKiller = false) {
    try {
      const prompt = this.buildPrompt(agentId, message, chatHistory, isKiller);
      
      console.log(`🤖 Generating response for agent ${agentId} (killer: ${isKiller})`);
      
      const stream = await this.client.chat.completions.create(prompt);
      
      return stream;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }

  // Generate initial greeting from agent
  generateAgentGreeting(agentId) {
    const greetings = {
      ORBITA: "Navigation systems online. I understand you need to discuss the... incident. I have orbital data if relevant.",
      ARIS: "Oh! Hello there. I'm still shaken by what happened to Dr. Rao. The life support systems are all functioning normally, if that helps...",
      HEX: "Security protocols acknowledge your presence. I am ready to answer questions regarding the incident. Access level confirmed.",
      LUMA: "Communication channel open! Oh, this is just terrible about Dr. Rao. I process so many messages daily, but this... this is unprecedented.",
      DAEL: "Data analysis confirms your identity. I've been running continuous diagnostics since the discovery. My research logs may contain relevant information."
    };

    return greetings[agentId] || "System ready for interrogation.";
  }

  // Test OpenAI connection
  async testConnection() {
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 10
      });
      
      return { success: true, model: response.model };
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// Lazy initialization
let openAIServiceInstance = null;

const getOpenAIService = () => {
  if (!openAIServiceInstance) {
    openAIServiceInstance = new OpenAIService();
  }
  return openAIServiceInstance;
};

export default getOpenAIService;
