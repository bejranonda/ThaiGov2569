# ThaiGov2569 - PM Simulator

A React-based simulation game where you play as the Prime Minister of Thailand. Build coalition governments, manage cabinet ministries, and experience the challenges of Thai politics in the year 2569 (2026).

**Live Demo:** https://github.com/bejranonda/ThaiGov2569

## Features

| Feature | Description |
|---------|-------------|
| **Coalition Building** | Form a government from 500 MPs across 10 political parties |
| **Policy Selection** | Select key policies that your government will prioritize (Economy, Social, Education, etc.) |
| **Cabinet Allocation** | Assign ministries to parties based on their policies and coalition strength |
| **AI-Powered Political Chat** | Chat with your government! PM and Opposition Leader respond using Cloudflare Workers AI (Llama 3.1-8B) with authentic Thai political personas |
| **Data Persistence** | Simulation results saved to Cloudflare D1 Database |

## What's New in v0.1.0

- **Dual AI Responses**: Prime Minister and Opposition Leader both respond to your questions
- **Enhanced AI Model**: Upgraded to `@cf/meta/llama-3.1-8b-instruct` for better Thai language understanding
- **Party-Specific Personas**: Each party has unique personality traits, policy positions, and signature closing phrases
- **Coalition Awareness**: PM knows their coalition partners and seat count in parliament
- **Longer Responses**: AI can now respond with up to 4 sentences for more detailed answers

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Cloudflare Pages Functions
- **AI:** Cloudflare Workers AI (Llama 3.1-8B Instruct)
- **Database:** Cloudflare D1
- **Icons:** Lucide React

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

### 3. Initialize Database Schema

```bash
# Local development
npx wrangler d1 execute thaigov2569-db --local --file=schema.sql

# Production
npx wrangler d1 execute thaigov2569-db --remote --file=schema.sql
```

### 4. Deploy to Cloudflare Pages

```bash
npm run deploy
```

This builds the Vite project and deploys it to Cloudflare Pages using Wrangler.

## Project Structure

```
ThaiGov2569/
├── src/
│   ├── App.jsx          # Main React application
│   ├── main.jsx         # React entry point
│   ├── index.css        # Global styles
│   ├── data.js          # Party and ministry data
│   └── policies.js      # Policy definitions
├── functions/
│   └── api/
│       └── chat.js      # AI Chat endpoint (PM + Opposition)
├── Campaign2569/        # Campaign-related content
├── dist/                # Build output (generated)
├── schema.sql           # Database schema
├── wrangler.toml        # Cloudflare configuration
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # Dependencies and scripts
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (http://localhost:5173) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally with Wrangler |
| `npm run deploy` | Deploy to Cloudflare Pages |

## AI Chat System

The chat system uses Cloudflare Workers AI with the Llama 3.1-8B Instruct model:

### Features
- **Free Tier**: 10,000 Neurons/day (~300 chat turns)
- **Dual Responses**: PM answers first, then Opposition Leader adds their perspective
- **Context Aware**: Knows coalition partners, seat counts, and government policies
- **Party Personalas**: Each party has unique speaking style and signature phrases

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
- Powered by [Cloudflare Pages](https://pages.cloudflare.com/)
- AI by [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai)
- Model: Meta Llama 3.1 8B Instruct
