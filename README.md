# Sim-Government: Thailand 2569 -- PM Simulator

A React-based political simulation game where you play as the Prime Minister of Thailand. Build coalition governments, select policies, manage cabinet ministries, and govern through AI-powered political discourse -- all based on real Thai political party data from the 2569 (2026) election.

**Live Demo:** https://simgov2569.autobahn.bot

Hosted on Autobahn Bot platform with Cloudflare Workers AI backend.

## The "Thai Election 2569" Series

This game is **Part 2** of the Thai Election 2569 series:

| Game | Phase | Description |
|------|-------|-------------|
| [**Sim-Thailand 2569**](https://thalay.eu/sim2569) | Before Election | Choose policies across 6 urgent issues and discover which of 18 parties matches your values |
| **Sim-Government 2569** (this project) | After Election | Form a coalition government, select policies, appoint ministers, govern the country, and see your results |

**Narrative connection:** Sim-Thailand helps voters explore party policies before casting their vote. Once the election is over, Sim-Government picks up the story -- now it's time to form a government and put those policies into action.

## Features

| Feature | Description |
|---------|-------------|
| **Introduction Screen** | Developer credits, 6 floating emojis, poll reference links (NIDA/Dusit), public stats view |
| **5-Step Progress Indicator** | Clickable visual tracker with backward navigation, reshuffle counter for cabinet |
| **Coalition Building** | Form government from 500 MPs across 11 parties, sorted by seats descending |
| **Policy Selection** | Step-through 6 categories, randomized order, no party names shown |
| **Cabinet Allocation** | Assign 8 ministries, quick actions (Auto-assign, PM party, Clear), 2 reshuffle limit |
| **AI-Powered Political Chat** | 1 question limit, streaming text effect, action buttons after response |
| **Emoji Confetti** | Party-specific emoji symbols (🍊❤️🌿💧⭐🏛️🌙💰🌸🦅🎉) celebration |
| **Results & Scoring** | 100-point score across 4 categories, dynamic commentary |
| **Screenshot/Share** | html2canvas integration with Web Share API and download fallback |
| **Aggregate Stats** | Public leaderboards showing PM distribution, score averages |
| **Data Persistence** | Full session data saved to Cloudflare D1 with scoring metrics |

## What's New in v0.4.0

**Data Update + UX Refinement**

### Data Updates (Phase 1)
- **2026 Poll Data**: Updated party seats from NIDA/Dusit polls (Jan/Feb 2026)
- **New Parties**: Added SET (เศรษฐกิจ, 19 seats), TST (ไทยสร้างไทย, 9 seats), SRT (เสรีรวมไทย, 5 seats), OTH (พรรคเล็กอื่นๆ, 18 seats)
- **Removed Parties**: CTP, TKM, OKM (policies merged into OTH)
- **Total 500 Seats**: PP 170, BJT 111, PTP 84, DEM 61, SET 19, UTN 10, TST 9, PCC 7, PPRP 6, SRT 5, OTH 18

### Intro Page Enhancements (Phase 2)
- **Developer Credits**: thalay.eu logo + Facebook icon at top of intro
- **Floating Emojis**: 6 animated emoji symbols (📜🏛️🗳️⚖️🇹🇭📊) floating across intro screen
- **Poll Reference Links**: Direct links to NIDA Poll (Jan 69) and Dusit Poll (Dec 68) PDFs
- **Version Display**: v0.4.0 shown at bottom of intro page

### Policy Selection Overhaul (Phase 3)
- **Step-Through Categories**: Navigate 6 policy categories one-by-one with sticky header
- **Category Progress Bar**: Visual dots showing progress through categories
- **No Party Names**: Policy cards hide party affiliations to reduce bias
- **Randomized Order**: Fisher-Yates shuffle for policy presentation order
- **No Budget Limit**: Select as many policies as desired
- **6 Categories**: Economy, Social, Education, Security, Environment, Politics

### Coalition Sorting (Phase 4)
- **Seats Descending**: Parties automatically sorted by seats (highest first)

### Confetti Enhancement (Phase 5)
- **Emoji Symbols**: Party-specific emojis (🍊❤️🌿💧⭐🏛️🌙💰🌸🦅🎉) as confetti particles
- **shapeFromText()**: Uses canvas-confetti's shapeFromText for emoji particles

### Chat Room Overhaul (Phase 6)
- **1 Question Limit**: Users can ask only 1 question to the government
- **Streaming Text**: AI responses stream character-by-character (20ms delay) with blinking cursor
- **Action Buttons**: After response, show "ปรับ ครม." (reshuffle) and "ยืนยันจัดตั้งรัฐบาล" (confirm) buttons

### Scoring Revamp (Phase 7)
- **Renamed Categories**: "เสถียรภาพรัฐบาล", "นโยบายครอบคลุมทุกมิติ", "ครม. ตรงกับจุดแข็งพรรค", "ถามคำถามสำคัญ"
- **No Letter Grades**: Removed A-F grading, kept numerical score out of 100
- **Dynamic Commentary**: Bullet points based on score breakdown (e.g., "รัฐบาลมีฐานเสียงที่มั่นคง")

### Results Page + Share (Phase 8)
- **Screenshot/Share**: html2canvas integration for sharing results as image
- **Web Share API**: Native share on mobile with download fallback
- **Error Handling**: Graceful fallback for stats API failures (5s timeout)

### AI Prompt Improvements (Phase 9)
- **Updated Parties**: All 11 parties reflected in chat.js
- **No Fixed Closing Phrases**: Removed hardcoded phrases like "ลงท้ายว่า..."
- **Cabinet Context**: Full cabinet mapping sent to AI for contextual responses
- **Natural Language**: Prompts guide AI to generate appropriate closings

### Build Changes
- **html2canvas**: Added for screenshot feature (201KB code-split chunk)
- **Total Bundle**: ~210KB JS + ~38KB CSS + 201KB html2canvas (lazy) + 11KB confetti (lazy)

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Hosting:** Autobahn Bot
- **Backend:** Cloudflare Pages Functions
- **AI:** Cloudflare Workers AI (Llama 3.1-8B) + OpenRouter backup (Llama 3.3-70B)
- **Database:** Cloudflare D1
- **Effects:** canvas-confetti (code-split)
- **Screenshot:** html2canvas (code-split)
- **Icons:** Lucide React
- **Font:** Anuphan (Google Fonts)

## Quick Start

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/bejranonda/ThaiGov2569.git
cd ThaiGov2569

# Install dependencies
npm install
```

### Development

```bash
# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

### Build for Production

```bash
# Build the application
npm run build

# Preview the production build locally
npm run preview
```

## Cloudflare Deployment

### Prerequisites

- Cloudflare Account (free tier works)
- Wrangler CLI installed: `npm install -g wrangler`

### 1. Authenticate with Cloudflare

```bash
npx wrangler login
```

### 2. Create D1 Database

```bash
npx wrangler d1 create thaigov2569-db
```

Copy the `database_id` from the output and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "thaigov2569-db"
database_id = "YOUR_DATABASE_ID_HERE"
```

### 3. Set OpenRouter API Key (Optional Backup)

Get your free API key from [OpenRouter](https://openrouter.ai/keys) and set it as a secret:

```bash
echo "your-api-key-here" | npx wrangler pages secret put OPENROUTER_API_KEY --project-name=thaigov2569
```

The app will use Cloudflare Workers AI by default and automatically fall back to OpenRouter when limits are reached.

### 4. Initialize Database Schema

```bash
# Local development
npx wrangler d1 execute thaigov2569-db --local --file=schema.sql

# Production
npx wrangler d1 execute thaigov2569-db --remote --file=schema.sql
```

### 5. Build for Production

```bash
npm run build
```

The app is currently hosted on Autobahn Bot platform. The frontend uses Cloudflare Pages Functions for the AI chat backend.

## Project Structure

```
SimGov2569/
├── public/              # Static assets (favicon, etc.)
├── src/
│   ├── App.jsx          # Main React application (intro, steps 1-5, all UI)
│   ├── main.jsx         # React entry point
│   ├── index.css        # Global styles, animations, tooltips, floating emojis
│   ├── data.js          # Party and ministry data (11 parties, 8 ministries)
│   └── policies.js      # 132 policy definitions with references
├── functions/
│   └── api/
│       ├── chat.js      # AI Chat endpoint (PM + Opposition dual responses)
│       └── stats.js     # Session save + aggregate stats endpoint
├── docs/
│   └── CONCEPT.md       # Project concept and design philosophy
├── Campaign2569/        # Campaign-related content
├── ThaiSim2569/         # Sim-Thailand 2569 (predecessor game)
├── dist/                # Build output (generated)
├── schema.sql           # Database schema (simulation_results + game_sessions)
├── wrangler.toml        # Cloudflare configuration
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration (Anuphan font, animations)
└── package.json         # Dependencies and scripts
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (http://localhost:5173) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally with Wrangler |
| `npm run deploy` | Deploy to Cloudflare Pages (if needed) |

## Game Flow

```
Intro Screen (step 0)
  │  "เริ่มจัดตั้งรัฐบาล" or "ดูผลโหวตและการตั้งรัฐบาล"
  ▼
Step 1: Coalition Building
  │  Select parties to reach 250+ seats
  ▼
Step 2: Policy Selection
  │  Step through 6 categories, select policies (randomized, no party names)
  ▼
Step 3: Cabinet Allocation
  │  Assign parties to 8 ministries + PM (2 reshuffles max)
  ▼
Step 4: Government Chat
  │  Chat with AI-powered PM and Opposition (confetti celebration!)
  │  "จบบริหาร - ดูผลลัพธ์"
  ▼
Step 5: Results & Scoring
     Score breakdown (100pts), grade A-F, government summary, aggregate comparison
```

## Scoring System

The game evaluates your government across 4 categories (100 points total):

| Category | Max Points | Formula |
|----------|-----------|---------|
| เสถียรภาพรัฐบาล (Coalition Stability) | 25 | Margin above 250 seats (capped at 100 extra) |
| นโยบายครอบคลุมทุกมิติ (Policy Diversity) | 25 | Unique categories covered / 6 total categories |
| ครม. ตรงกับจุดแข็งพรรค (Cabinet Expertise) | 25 | Party has relevant policy expertise / 8 ministries |
| ถามคำถามสำคัญ (Engagement) | 25 | Binary: 25 if asked question, 0 if not |

## AI Chat System

The chat system uses Cloudflare Workers AI with automatic fallback to OpenRouter:

### AI Models
| Priority | Model | Parameters | Thai Support |
|----------|-------|------------|--------------|
| **Primary** | Cloudflare Llama 3.1-8B | 8B | Yes |
| **Backup** | OpenRouter Llama 3.3-70B | 70B | Yes (Explicit) |

### Features
- **Free Tier**: Cloudflare (10,000 Neurons/day) + OpenRouter (free tier)
- **Automatic Fallback**: Switches to OpenRouter when Cloudflare limits are reached
- **Dual Responses**: PM answers first, then Opposition Leader adds their perspective
- **Context Aware**: Knows coalition partners, seat counts, government policies
- **Party Personas**: Each party has unique speaking style and signature phrases

### Party Personas

Each party has unique speaking style reflected in AI responses. The system now generates natural closings instead of fixed phrases.

**11 Parties:** ประชาชน (PP), ภูมิใจไทย (BJT), เพื่อไทย (PTP), ประชาธิปัตย์ (DEM), เศรษฐกิจ (SET), รวมไทยสร้างชาติ (UTN), ไทยสร้างไทย (TST), ประชาชาติ (PCC), พลังประชารัฐ (PPRP), เสรีรวมไทย (SRT), พรรคเล็กอื่นๆ (OTH)

## Database Schema

```sql
-- Legacy table (backward compat)
CREATE TABLE simulation_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coalition TEXT,
  cabinet TEXT,
  selected_policies TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- New full session storage (v0.3.0+)
CREATE TABLE game_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  pm_party TEXT NOT NULL,
  coalition TEXT NOT NULL,
  coalition_seats INTEGER NOT NULL,
  selected_policies TEXT NOT NULL,
  policy_count INTEGER NOT NULL,
  cabinet TEXT NOT NULL,
  chat_questions TEXT,
  chat_count INTEGER DEFAULT 0,
  score_total INTEGER,
  score_coalition INTEGER,
  score_diversity INTEGER,
  score_cabinet INTEGER,
  score_engagement INTEGER,
  grade TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Built with [React](https://react.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Hosted on [Autobahn Bot](https://autobahn.bot)
- Backend by [Cloudflare Pages Functions](https://pages.cloudflare.com/)
- AI by [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai)
- Backup AI by [OpenRouter](https://openrouter.ai/)
- Confetti by [canvas-confetti](https://github.com/catdad/canvas-confetti)
- Screenshots by [html2canvas](https://html2canvas.hertzen.com/)
- Primary Model: Meta Llama 3.1 8B Instruct
- Backup Model: Meta Llama 3.3 70B Instruct
- Predecessor: [Sim-Thailand 2569](https://thalay.eu/sim2569) by [thalay.eu](https://thalay.eu/)
