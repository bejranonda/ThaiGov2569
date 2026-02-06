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
| **Introduction Screen** | Animated intro with game flow preview, sequel badge, election reference links, and public stats view |
| **5-Step Progress Indicator** | Clickable visual tracker with backward navigation, reshuffle counter for cabinet |
| **Coalition Building** | Form a government from 500 MPs across 10 parties with party-colored selection feedback |
| **Policy Selection** | Budget system (max 10 policies), accordion categories, sticky header, search with counts |
| **Cabinet Allocation** | Assign 8 ministries, quick actions (Auto-assign, PM party, Clear), 2 reshuffle limit |
| **AI-Powered Political Chat** | Chat with your government! PM and Opposition respond using Cloudflare Workers AI |
| **Party-Themed Confetti** | Celebration moment when entering government with PM party colors |
| **Results & Scoring** | 100-point score across 4 categories, letter grade (A-F), government summary |
| **Aggregate Stats** | Public leaderboards showing PM distribution, grade distribution, averages |
| **Data Persistence** | Full session data saved to Cloudflare D1 with scoring metrics |

## What's New in v0.3.0

**Major UX Overhaul - Complete Feature Release**

### Navigation & Flow
- **Clickable Step Indicator**: Click any completed step to navigate backward, with hover ring effects
- **Cabinet Reshuffle Limit**: Maximum 2 reshuffles with visual dot counter
- **Election Reference Links**: Added pre/post election data source links on intro
- **Public Stats View**: "ดูผลโหวตและการตั้งรัฐบาล" button for aggregate stats without playing

### Policy Selection Overhaul
- **Budget System**: Max 10 policies with visual dot meter in sticky header
- **Accordion Categories**: Collapsible category sections with "เลือกแล้ว X" badges
- **Sticky Header**: Always-visible navigation, budget counter, and next button
- **Budget Exhaustion**: Disabled cards + amber notice when budget depleted
- **Search Shows Flat Results**: When searching, bypass accordion for filtered grid

### Celebration & Scoring
- **Party-Themed Confetti**: Fires on government entry with PM party colors (code-split, ~11KB)
- **Results Screen (Step 5)**: Animated SVG score ring, letter grade with pop animation
- **4-Category Scoring**: Coalition stability (25), Policy diversity (25), Cabinet expertise (25), Engagement (25)
- **Grade Distribution**: A (90+), B (75+), C (60+), D (40+), F (<40)
- **Government Summary**: PM, coalition parties, seat count, policies chosen
- **Aggregate Comparison**: See how you compare with other players

### Backend & Data
- **game_sessions Table**: Full session storage with all scoring fields
- **Expanded Stats API**: POST saves complete session, GET returns aggregate stats
- **PM Distribution Chart**: See which parties players choose as PM
- **Grade Distribution**: Visual breakdown of player grades

### Polish & Animations
- **Score Ring Animation**: Smooth stroke-dasharray transition
- **Grade Pop Animation**: Scale + rotate bounce on grade reveal
- **Accordion Animation**: Smooth open/close with max-height
- **Budget Dot Pulse**: Visual feedback when budget exhausted
- **Footer Logos**: thalay.eu logo image + Facebook SVG icon

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Hosting:** Autobahn Bot
- **Backend:** Cloudflare Pages Functions
- **AI:** Cloudflare Workers AI (Llama 3.1-8B) + OpenRouter backup (Llama 3.3-70B)
- **Database:** Cloudflare D1
- **Effects:** canvas-confetti (code-split)
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
├── src/
│   ├── App.jsx          # Main React application (intro, steps 1-5, all UI)
│   ├── main.jsx         # React entry point
│   ├── index.css        # Global styles, animations, tooltips
│   ├── data.js          # Party and ministry data (10 parties, 8 ministries)
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
  │  Choose 3-10 policies from coalition parties (budget system, accordion)
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
| Coalition Stability | 25 | Margin above 250 seats (capped at 100 extra) |
| Policy Diversity | 25 | Unique categories covered / 10 total categories |
| Cabinet Expertise | 25 | Party has relevant policy expertise / 8 ministries |
| Engagement | 25 | Chat messages sent (capped at 10) |

**Grade Scale:** A (90+), B (75+), C (60+), D (40+), F (<40)

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

| Party | Style | Signature Phrase |
|-------|-------|------------------|
| เพื่อไทย | Soft-spoken but serious | "เราจะทำให้ได้ รับรองครับ" |
| ประชาชน | Direct, anti-monopoly | "เรื่องนี้เราไม่ประนีประนอม" |
| ภูมิใจไทย | Action-oriented | "พูดแล้วทำครับ" |
| รทสช. | Peace and stability | "เพื่อความสงบของชาติ" |
| พลังประชารัฐ | Experience-focused | "เราเคยทำได้แล้ว จะทำได้อีก" |
| ประชาธิปัตย์ | Democracy-focused | "เพื่อประชาธิปไตยที่แท้จริง" |

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
- Primary Model: Meta Llama 3.1 8B Instruct
- Backup Model: Meta Llama 3.3 70B Instruct
- Predecessor: [Sim-Thailand 2569](https://thalay.eu/sim2569) by [thalay.eu](https://thalay.eu/)
