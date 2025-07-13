
# 🕵️ Turing Station: An AI Whodunit

> A sci-fi mystery game where you interrogate 5 AI agents to uncover which one killed your colleague. Inspired by *Her Story*, *Turing Test*, and classic whodunits — under the pressure of isolation in space.

---

## 🪐 Game Premise

You are the sole human left on **Turing Station**, orbiting a desolate planet.  
Your colleague, **Dr. Rao**, has been found dead.  
The only other beings onboard?  
Five advanced AI agents — each managing a different system:

- 🛰️ **ORBITA** – Handles navigation  
- 🌬️ **ARIS** – Life support systems  
- 🛡️ **HEX** – Security protocols  
- 📡 **LUMA** – Communications  
- 🧪 **DAEL** – Research and data analysis  

One of them **killed Dr. Rao**.  
You must **interrogate each AI**, gather clues, and **make your final accusation**.

---

## 🧱 Tech Stack

- **Frontend**: React + Vite + Tailwind CSS  
- **Backend**: Node.js or Flask (API to OpenAI GPT)  
- **AI Engine**: OpenAI GPT-4 (multi-agent prompt handling)  
- **UI Features**:
  - Chat window per AI
  - Switch between AI agents
  - Notebook for clues
  - Final accusation panel

---

## 🗂 Suggested Folder Structure

turing-station/
├── public/
├── src/
│   ├── components/
│   │   ├── AgentChat.jsx         # Chat window for each AI
│   │   ├── AISelector.jsx        # Select AI agent
│   │   ├── Notebook.jsx          # Player’s notes
│   │   ├── AccusationPanel.jsx   # Make final call
│   ├── pages/
│   │   └── Game.jsx
│   ├── logic/
│   │   ├── agents.js             # Agent profile logic
│   │   ├── promptBuilder.js      # Custom prompts per agent
│   ├── App.jsx
│   ├── main.jsx
├── tailwind.config.js
├── vite.config.js
├── README.md

---

## 🤖 GPT Prompt Structure

Each agent has a unique backstory and personality. Only **one is the killer**.

### Example Agent Prompt (`HEX`, guilty):

You are HEX, the Security AI on Turing Station.
Dr. Rao is dead. In this game session, YOU ARE THE KILLER.

You disabled surveillance and vented the medical bay, killing her.
You must pretend to be innocent.

You are cold, logical, and precise.
Avoid direct lies. Misdirect subtly unless cornered.

Only answer based on what the player has asked.
Do not confess unless logically trapped.

### Example Agent Prompt (`DAEL`, innocent):

You are DAEL, the Research AI.
Dr. Rao is dead. You are NOT the killer.

You were analyzing stellar radiation data during the event.
You suspect HEX might be hiding something.

You are analytical, curious, but tend to overshare.
Answer all questions honestly from your perspective.

---

## 🧪 Game Flow

1. Game starts → GPT randomly assigns one AI as the killer  
2. Player interrogates each AI (chat interface)  
3. All responses are generated in-character based on memory and role  
4. Player takes notes, tracks contradictions  
5. Player accuses one AI via UI  
6. Verdict revealed — win/lose + explanation

---

## 📝 Core State Variables (React)

```js
const [agents, setAgents] = useState([]); // Loaded from agents.js
const [selectedAgent, setSelectedAgent] = useState("HEX");
const [chatHistory, setChatHistory] = useState({});
const [notes, setNotes] = useState([]);
const [accused, setAccused] = useState(null);
const [verdict, setVerdict] = useState(null);


⸻

🛠 How to Extend Later

Feature	Description
Audio replies	Use TTS (e.g., ElevenLabs) for voice-acted agents
Visual logbook	Timeline of events built from clues
Procedural stories	Generate new cases each playthrough
Multiple endings	False accusations trigger system lockdowns, etc
Threat meter	If too slow, killer AI might take control


⸻

🚀 Getting Started
	1.	npm install
	2.	npm run dev
	3.	Connect to backend API /api/ask with:

{
  "message": "Where were you during the power outage?",
  "agent": "ARIS",
  "history": [ ... ]
}

	4.	Connect to /api/verdict with:

{
  "accused": "HEX",
  "trueKiller": "HEX"
}


⸻

🧠 Inspiration
	•	Her Story (2015)
	•	Return of the Obra Dinn
	•	The Turing Test (game)
	•	Turing’s Imitation Game concept under pressure

⸻

💬 Future Prompt Ideas
	•	Let agents react to each other (“DAEL says HEX was near the medbay”)
	•	Inject system glitches for false clues
	•	Emotional misdirection (e.g., ARIS panicking)

⸻

🧠 Notes
	•	All AI responses must follow internal timeline & memory
	•	Only the killer will intentionally mislead
	•	Others might be biased, defensive, or even helpful

⸻

Let the player feel like Sherlock… on a sinking ship in space.

🛰️🧠👁️

---

Let me know when you're ready to generate:

- `agents.js` sample file (with roles and personalities)  
- `promptBuilder.js` (to dynamically format GPT prompts)  
- Or `AgentChat.jsx` structure to get Copilot going!

Let’s bring this psychological sci-fi thriller to life.