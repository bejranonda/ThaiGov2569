# Sim-Government: Thailand 2569 -- PM Simulator

A React-based political simulation game where you play as the Prime Minister of Thailand. Build coalition governments, select policies, manage cabinet ministries, and govern through AI-powered political discourse -- all based on real Thai political party data from the 2569 (2026) election.

**Live Demo:** https://simgov2569.autobahn.bot

Hosted on Autobahn Bot platform with Cloudflare Workers AI backend.

## The "Thai Election 2569" Series

This game is **Part 2** of the Thai Election 2569 series:

| Game | Phase | Description |
|------|-------|-------------|
| [**Sim-Thailand 2569**](https://thalay.eu/sim-thailand) | Before Election | Choose policies across 6 urgent issues and discover which of 18 parties matches your values |
| **Sim-Government 2569** (this project) | After Election | Form a coalition government, select policies, appoint ministers, and govern the country |

**Narrative connection:** Sim-Thailand helps voters explore party policies before casting their vote. Once the election is over, Sim-Government picks up the story -- now it's time to form a government and put those policies into action.

## Features

| Feature | Description |
|---------|-------------|
| **Introduction Screen** | Animated intro page with game flow preview, sequel connection to Sim-Thailand, and educational disclaimer |
| **Step Progress Indicator** | Visual 4-step tracker showing completion status across all game phases |
| **Coalition Building** | Form a government from 500 MPs across 10 political parties with party-colored selection feedback |
| **Policy Selection** | Browse 132 real policies with search, category filters with counts, and party-colored accent borders |
| **Cabinet Allocation** | Assign 8 ministries to coalition parties with quick actions (Auto-assign, PM party, Clear all) |
| **AI-Powered Political Chat** | Chat with your government! PM and Opposition Leader respond using Cloudflare Workers AI with authentic Thai political personas |
| **Data Persistence** | Simulation results saved to Cloudflare D1 Database |

## What's New in v0.2.0

- **Introduction Screen**: Full-screen animated intro with game narrative, sequel badge linking to Sim-Thailand, game flow preview, and educational disclaimer
- **Series Connection**: Explicit link to Sim-Thailand 2569 as the predecessor game in the election series
- **Step Progress Indicator**: 4-dot visual progress bar showing completed/active/upcoming steps
- **Party-Colored Selections**: Coalition parties show selection feedback in their own party color (not generic blue)
- **Enhanced Card Interactions**: Hover lift, click pulse, animated checkmarks (check-pop), and shimmer effects on selected cards
- **Policy Category Counts**: Category filter pills now show the number of available policies per category
- **Policy Reference Sources**: Each policy card shows its reference source (e.g., "Nation Debate", "White Paper")
- **Cabinet Color Feedback**: Ministry icons change to the assigned party's color
- **Chat Animations**: Messages slide in from left/right with smooth entrance animations
- **Anuphan Thai Font**: Professional Thai font throughout the app
- **Glassmorphism & Polish**: Frosted footer bar, gradient backgrounds, glow effects

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Hosting:** Autobahn Bot
- **Backend:** Cloudflare Pages Functions
- **AI:** Cloudflare Workers AI (Llama 3.1-8B) + OpenRouter backup (Llama 3.3-70B)
- **Database:** Cloudflare D1
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
│   ├── App.jsx          # Main React application (intro, steps 1-4, all UI)
│   ├── main.jsx         # React entry point
│   ├── index.css        # Global styles, animations, tooltips
│   ├── data.js          # Party and ministry data (10 parties, 8 ministries)
│   └── policies.js      # 132 policy definitions with references
├── functions/
│   └── api/
│       └── chat.js      # AI Chat endpoint (PM + Opposition dual responses)
├── docs/
│   └── CONCEPT.md       # Project concept and design philosophy
├── Campaign2569/        # Campaign-related content
├── ThaiSim2569/         # Sim-Thailand 2569 (predecessor game)
├── dist/                # Build output (generated)
├── schema.sql           # Database schema
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
  │  "เริ่มจัดตั้งรัฐบาล"
  ▼
Step 1: Coalition Building
  │  Select parties to reach 250+ seats
  ▼
Step 2: Policy Selection
  │  Choose 3+ policies from coalition parties
  ▼
Step 3: Cabinet Allocation
  │  Assign parties to 8 ministries + PM
  ▼
Step 4: Government Chat
     Chat with AI-powered PM and Opposition
```

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
- **Context Aware**: Knows coalition partners, seat counts, and government policies
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
CREATE TABLE simulation_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  coalition TEXT,      -- JSON string of coalition party IDs
  cabinet TEXT,        -- JSON string of ministry assignments
  selected_policies TEXT, -- JSON string of selected policy IDs
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
- Primary Model: Meta Llama 3.1 8B Instruct
- Backup Model: Meta Llama 3.3 70B Instruct
- Predecessor: [Sim-Thailand 2569](https://thalay.eu/sim-thailand) by [thalay.eu](https://thalay.eu/)
