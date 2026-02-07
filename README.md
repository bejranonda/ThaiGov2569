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
| **Introduction Screen** | Developer credits, clean gradient background, poll reference links (NIDA/Dusit), public stats view |
| **5-Step Progress Indicator** | Clickable visual tracker with backward navigation, 1-reshuffle limit for PM nomination |
| **Coalition Building** | Form government from 500 MPs across 11 parties, sorted by seats descending, cleaner party cards |
| **Policy Selection** | Step-through 6 categories, randomized order, no party names shown, 17 grouped similar policies, **policy helper inline with pro/con** |
| **PM Nomination + Cabinet** | Propose PM candidate and assign 14 ministries + PM, quick actions (จัด ครม. ตามโควตา สส., PM party, Clear), 1 reshuffle max |
| **Parliamentary PM Vote** | PM candidate presents vision to parliament, 1 question limit, shuffled suggestions (12 total), skip option, sequential streaming (PM → Opposition) |
| **Emoji Confetti** | Party-specific emoji symbols (🍊❤️🌿💧⭐🏛️🌙💰🌸🦅🎉) celebration |
| **Sound Effects** | Web Audio API (0KB) sounds for select, deselect, success, transition, fanfare + mute toggle |
| **Results & Scoring** | 100-point score across **6 categories** (coalition, economy, social, security, alignment, budget) + **balance bonus**, dynamic commentary |
| **Screenshot/Share** | html2canvas integration with Web Share API and download fallback |
| **Aggregate Stats** | Public leaderboards showing PM distribution, score averages |
| **Data Persistence** | Full session data saved to Cloudflare D1 with scoring metrics |

## What's New in v0.8.2

**Coalition Scoring Refinement: Smooth Curve with Optimal Plateau (57-66%)**

### Coalition Scoring System
- **Precarious** (50.2-57%): Ramps up from 0 to 25 points
  - Risky if anyone leaves coalition
  - Encourages building stronger government
- **Optimal** (57-66%): Full 25 points plateau
  - Best democratic balance
  - 285-330 seats out of 500
  - Opposition remains strong (34% voice)
  - **Peak performance zone**
- **Over-qualified** (66-75%): Ramps down from 25 to 0 points
  - Beyond ideal range
  - Opposition weakened
  - Approaching dangerous territory
- **Dangerous** (75%+): 0 points
  - Can amend constitution alone
  - Opposition loses meaningful oversight
  - Threatens democratic balance

### Scoring Curve (Smooth with Plateau)
```
Points
  25  ═══════════════════  (57-66% optimal plateau)
      ╱                   ╲
      Ramp up          Ramp down
      (50.2-57%)       (66-75%)
```

### Example Scores
| Seats | % | Points | Status |
|-------|---|--------|--------|
| 251 | 50.2% | 0 | ❌ No majority |
| 280 | 56% | 21.9 | ⚠️ Precarious |
| 285 | 57% | 25 | ✅ Optimal starts |
| 308 | 61.6% | 25 | ✅ Solid majority |
| 330 | 66% | 25 | ✅ Optimal ends |
| 353 | 70.6% | 12.5 | ⚠️ Over-qualified |
| 375 | 75% | 0 | ❌ Dangerous |

### Why This Design
- **Smooth Transitions**: No artificial cliffs in scoring
- **Clear Optimal Zone**: 57-66% is unambiguously the best range
- **Educational**: Teaches players about democratic balance
- **Realistic**: Reflects actual coalition challenges in Thai politics
- **Fair**: Rewards strategic coalition building, not lucky threshold-crossing

---

## What's New in v0.8.1

**Configuration Fixes & AI Revert: Cloudflare Pages, Llama AI, Database Setup**

### Bug Fixes
- ✅ **Fixed Cloudflare Pages Deployment**: Corrected project name from `thaigov2569` to `simgov2569`
- ✅ **Fixed Environment Configuration**: Removed unsupported `[env.development]` (Pages only supports `preview`/`production`)
- ✅ **Fixed AI Binding Scoping**: Moved AI and D1 bindings to environment-specific sections for proper secret resolution
- ✅ **Fixed Database Configuration**: Verified D1 database name and binding correctness

### AI Revert
- **Reverted**: Google Gemma 3-27B → **Cloudflare Workers AI (Llama 3.1-8B)**
- **Primary**: Cloudflare Workers AI (Llama 3.1-8B) - Free tier, native binding
- **Fallback**: OpenRouter (Llama 3.3-70B)
- **Benefit**: Removed external API key dependency for primary AI

### Configuration Updates
| Item | Before | After |
|------|--------|-------|
| Project Name | `thaigov2569` | `simgov2569` |
| Database Name | (mismatch) | `thaigov2569-db` (verified) |
| AI Primary | Google Gemma 3-27B | Cloudflare Llama 3.1-8B |
| Environment Bindings | Top-level (broken) | Scoped to env.production/preview ✅ |

### Local Development
- Added Vite proxy for `/api/*` routes to `localhost:8788` (Wrangler)
- Developers can now run `npm run dev` without manual Wrangler server setup (still need separate terminal)
- Helpful error message if Wrangler is not running

### Deployment Notes
- Build: `npm run build`
- Deploy: `npm run deploy` or `wrangler pages deploy dist`
- No Google AI API keys required (uses Cloudflare's native AI)
- OpenRouter as optional fallback for production reliability

---

## What's New in v0.8.0

**Story & UI Overhaul: Parliamentary PM Vote, Scoring Redesign, Policy Helper Inline**

### Story Reframe: Parliamentary Narrative
- **Intro Message**: "คุณคือแกนนำจัดตั้งรัฐบาล" → "รวมเสียง เลือกนโยบาย แล้วเสนอนายกเข้าสภาเพื่อโหวต"
- **Step 3 Title**: "จัดสรรโควตารัฐมนตรี" → "เสนอชื่อนายก และจัดสรรโควตา ครม."
- **Step 4 Title**: "ประชาชนถามนายก" → "แสดงวิสัยทัศน์ในสภา"
- **Role Context**: Coalition leader proposes PM candidate to parliament, MPs ask questions before vote
- **Greeting**: "ประธานสภา" (Speaker) introduces PM candidate and parliamentary procedure
- **Opposition Label**: "วิปฝ่ายค้าน (PartyName)" framing for parliamentary opposition

### New Scoring System (100 Points + 5 Bonus)
| Category | Points | Calculation |
|----------|--------|-------------|
| เสถียรภาพรัฐบาล | 25 | Margin above 250 seats (was 30) |
| นโยบาย: เศรษฐกิจ | 15 | Economy policies selected / total available |
| นโยบาย: สังคม | 15 | Social + Education policies / total available |
| นโยบาย: ความมั่นคง | 15 | Security + Environment + Politics policies / total available |
| นโยบายตรงจุดแข็งพรรคร่วม | 15 | **NEW**: % policies from coalition parties |
| งบประมาณ | 15 | **NEW**: Policy count efficiency (0-5=15pts, 6-10=12, ..., 26+=0pts) |
| **Bonus: ดุลยภาพนโยบาย** | **+5** | All 3 dimensions have ≥1 policy |

### Policy Helper Redesign
- **Moved to Sticky Header**: "ตัวช่วย" button now in top header (next to "ถัดไป"/"เลือกเสร็จ")
- **Inline Display**: Pro/con appear directly in policy cards (below description) when helper is visible
- **Cleaner UX**: Removed separate amber helper box, less visual clutter
- **Smart Filtering**: Only shows on policies that have pro/con fields (most grouped + key individual policies)

### Step 4 UI Improvements
- **Loading Message**: "ผู้เสนอตัวเป็นนายกกำลังเรียบเรียงคำตอบ..." instead of just bouncing dots
- **Suggested Questions**: Display as wrapping flex-wrap grid (no horizontal scroll), shuffled order with `useMemo`
- **Skip Option**: "ข้ามการถามคำถาม ไปโหวตเลย" button to bypass question and go to results
- **Post-Answer Buttons**:
  - "สภาโหวตรับรอง ดูผลลัพธ์" (was "ยืนยันจัดตั้งรัฐบาล")
  - "เสนอนายกคนใหม่ โหวตรอบใหม่" (was "ปรับ ครม."), max 1 retry (changed from 2)

### AI Prompts Enhanced
- **PM Context**: "แสดงวิสัยทัศน์ต่อสภา" (presenting vision to parliament)
- **PM Voice**: Uses "เรา" instead of "ฉัน" or "ผม" (collective leadership voice)
- **Opposition**: "วิปฝ่ายค้าน" (parliamentary opposition) framing
- **Sender Labels**: "วิปฝ่ายค้าน (PartyName)" for clarity

### Database Schema Updated
- New fields: `score_alignment`, `score_budget` (replacing `score_cabinet`)
- Removed: `score_cabinet` field (subsumed into alignment + budget scoring)

### UX Refinements
- Step indicator now shows "โหวตนายก" (was "ถามนายก") for step 4
- Reshuffle counter reduced from 2 to 1 (max 1 PM nomination retry)
- Commentary updated with budget and alignment insights
- Results page shows 6 scoring categories instead of 5

## What's New in v0.7.0

**Major Update: Scoring Overhaul, Sound Effects, Policy Helper, Story Framing**

### New Scoring System (100 Points Total)
| Category | Points | Calculation |
|----------|--------|-------------|
| เสถียรภาพรัฐบาล | 30 | Margin above 250 seats (harder curve: /150) |
| นโยบาย: เศรษฐกิจ | 15 | Economy policies selected / total available |
| นโยบาย: สังคม | 15 | Social + Education policies / total available |
| นโยบาย: ความมั่นคง | 15 | Security + Environment + Politics policies / total available |
| ครม. ตรงกับจุดแข็งพรรค | 20 | Expertise matches / 14 ministries |
| **Bonus: ดุลยภาพนโยบาย** | **+5** | All 3 dimensions have ≥1 policy |

### Harder Grading Curve
- **A+**: 92+ | **A**: 82+ | **B+**: 72+ | **B**: 62+ | **C+**: 52+ | **C**: 42+ | **D**: 32+ | **F**: <32

### Sound Effects (Web Audio API, 0KB)
- Five tone-based sound effects: select, deselect, success, transition, fanfare
- Mute toggle (Volume2/VolumeX icon) in header
- Persisted via localStorage
- No external audio files needed

### Policy Helper: "ขอตัวช่วย"
- Toggle button per policy category
- Shows up to 5 recommended policies with pros/cons
- Static pro/con data for ~20 key policies (grouped + individual)
- Helps users understand trade-offs

### Chat Step Overhaul: "ประชาชนถามนายก"
- New title and framing: User switches from coalition leader → citizen
- Role explanation box: "สลับบทบาท: ตอนนี้คุณเปลี่ยนจากผู้จัดตั้งรัฐบาล เป็นประชาชน"
- Greeting: "สวัสดีครับ ขณะนี้ท่านนายกรัฐมนตรีพร้อมรับฟังเสียงประชาชนแล้ว"

### AI Prompt Improvements
- max_tokens increased: 500 → 700 (prevents truncation)
- "ตอบให้จบประโยค ห้ามตัดกลางประโยค" instruction
- "ใช้ภาษาแบบผู้นำที่มีความเป็นมนุษย์ ไม่ใช่ข้อความราชการ"

### Cabinet Label Updates
- "Auto-assign" → "จัด ครม. ตามโควตา สส."
- "ตั้งค่าอัตโนมาติ" → "จัดแบบเร็ว"

### Story/Narrative Framing
- Intro tagline: "คุณคือพรรคร่วมรัฐบาล ที่มีเสียงมาจากประชาชน"
- Step 2 heading: "สิ่งที่อยากให้ทำใน 100 วันแรก"
- Header subtitle: "คุณคือพรรคร่วมรัฐบาล ที่มีเสียงมาจากประชาชน"

### Database Schema Updated
- New fields: `score_economy`, `score_social`, `score_security`, `score_balance_bonus`
- Removed: `score_diversity`, `score_engagement`

## What's New in v0.6.0

**Policy Grouping + More Ministries + Stats Fix**

### Grouped Similar Policies (17 Groups)
- **15 New Groups**: Merged similar policies across parties to reduce choice paralysis
  - Education: เรียนฟรีตลอดชีวิต, ปลดล็อกโรงเรียน, โรงเรียน 2 ภาษา, เรียนจบมีงานทำ
  - Economy: ลดค่าพลังงานทันที, ประกันรายได้เกษตรกร, กองทุน SME, กองทุนหมู่บ้าน
  - Social: สิทธิความเท่าเทียมทางเพศ, บำนาญผู้สูงอายุ
  - Politics: ปราบทุจริตเด็ดขาด, แก้กฎหมายล้าหลัง
  - Security: ปฏิรูปกองทัพ ยกเลิกเกณฑ์ทหาร
  - Environment: พ.ร.บ.อากาศสะอาด, Net Zero/Carbon Credit, โซลาร์เซลล์เสรี
- **Neutral Selection**: No party names shown on policy cards to reduce bias
- **Original Policies Kept**: All original data maintained for backward compatibility

### 6 New Ministries (14 Total)
- กระทรวงเกษตรฯ, กระทรวงยุติธรรม, กระทรวงการต่างประเทศ
- กระทรวงทรัพยากรฯ/สิ่งแวดล้อม, กระทรวงดิจิทัลฯ, กระทรวงพาณิชย์
- **Party Expertise Updated**: All 11 parties have relevant policy keys for new ministries

### Press Room: 12 Suggested Questions
- Expanded from 4 to 12 suggested questions covering economy, energy, environment, security, politics, education, and more
- Horizontally scrollable quick-pick buttons for easy selection

### Stats & Scoring Fix
- **Grade Computation**: Added A+ to F grading based on total score
- **Grade Saved**: Grade now included in session save to database
- **Race Condition Fix**: Stats fetch waits for session save to complete

## What's New in v0.5.0

**UX Improvements - Cleaner Interface**

### Intro Page Cleanup
- Removed floating emojis for cleaner, more modern look
- Simplified intro screen to focus on content and navigation

### Chat Room Enhancements
- "โฆษกรัฐบาล" branding for more authentic feel
- Sequential streaming: PM response first, then Opposition

### Coalition Card Redesign
- Removed emoji badges, larger typography, cleaner visuals

### Policy Selection Refinement
- Removed source references from policy cards
- 2 initial grouped policies (EV transport, free education)

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
- **Hosting:** Cloudflare Pages (via Autobahn Bot custom domain)
- **Backend:** Cloudflare Pages Functions
- **AI:** Cloudflare Workers AI (Llama 3.1-8B) + OpenRouter Llama 3.3-70B (fallback)
- **Database:** Cloudflare D1 (`thaigov2569-db`)
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
│   ├── data.js          # Party and ministry data (11 parties, 14 ministries)
│   └── policies.js      # 132 policy definitions + 17 grouped policies
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
Step 2: Policy Selection (100 วันแรก)
  │  Step through 6 categories, select policies (randomized, no party names)
  │  Policy helper shows inline pro/con when enabled
  ▼
Step 3: PM Nomination + Cabinet
  │  Propose PM candidate and assign parties to 14 ministries + PM (1 reshuffle max)
  ▼
Step 4: Parliamentary PM Vote (แสดงวิสัยทัศน์ในสภา)
  │  PM candidate presents vision, MPs ask 1 question, optional skip to vote
  │  Sequential AI responses: PM vision → Opposition response
  │  Confetti celebration on government formation!
  ▼
Step 5: Results & Scoring
     Score breakdown (100pts + 5 bonus), grade A+ to F, government summary, aggregate comparison
```

## Scoring System (v0.8.2)

The game evaluates your government across 6 categories (100 points + 5 bonus total):

| Category | Max Points | Formula |
|----------|-----------|---------|
| **เสถียรภาพรัฐบาล** (Coalition Stability) | 25 | **Smooth curve: 57-66% = full 25pts** |
| นโยบาย: เศรษฐกิจ (Economy Policies) | 15 | Economy policies selected / total economy available |
| นโยบาย: สังคม (Social Policies) | 15 | Social + Education policies / total available |
| นโยบาย: ความมั่นคง (Security Policies) | 15 | Security + Environment + Politics policies / total available |
| นโยบายตรงจุดแข็งพรรคร่วม (Policy-Party Alignment) | 15 | Aligned policies (from coalition parties) / selected total |
| งบประมาณ (Budget Discipline) | 15 | Fewer policies = higher score (0-5: 15pts, 6-10: 12pts, ..., 26+: 0pts) |
| **Bonus: ดุลยภาพนโยบาย** | **+5** | All 3 dimensions have ≥2 policies |

**Coalition Scoring Detail (v0.8.2):**
- 50.2-57% (251-285 seats): 0-25 points (ramps up)
- **57-66% (285-330 seats): Full 25 points (optimal)**
- 66-75% (330-375 seats): 25-0 points (ramps down)
- 75%+ (375+ seats): 0 points (dangerous)

**Grading:** A+(92+) A(82+) B+(72+) B(62+) C+(52+) C(42+) D(32+) F(<32)

## AI Chat System

The chat system uses Cloudflare Workers AI (Llama 3.1-8B) with automatic fallback to OpenRouter:

### AI Models (v0.8.1+)
| Priority | Model | Provider | Parameters | Thai Support |
|----------|-------|----------|-----------|--------------|
| **Primary** | Llama 3.1-8B Instruct | Cloudflare Workers AI | 8B | Yes ✅ |
| **Fallback** | Llama 3.3-70B Instruct | OpenRouter | 70B | Yes ✅ |

### Features
- **Native Binding**: Uses Cloudflare's built-in `env.AI` binding (no external API keys needed for primary)
- **Free Tier**: Cloudflare (10,000 operations/day) + OpenRouter (free tier fallback)
- **Automatic Fallback**: Switches to OpenRouter when Cloudflare limits are reached
- **Dual Responses**: PM answers first, then Opposition Leader adds their perspective
- **Context Aware**: Knows coalition partners, seat counts, government policies
- **Party Personas**: Each party has unique speaking style and signature phrases
- **Max Tokens**: 700 per response for detailed answers

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
  score_economy INTEGER,
  score_social INTEGER,
  score_security INTEGER,
  score_alignment INTEGER,
  score_budget INTEGER,
  score_balance_bonus INTEGER,
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
- Hosted on [Cloudflare Pages](https://pages.cloudflare.com/) via [Autobahn Bot](https://autobahn.bot)
- Backend by [Cloudflare Pages Functions](https://pages.cloudflare.com/)
- Primary AI by [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai) (Llama 3.1-8B)
- Fallback AI by [OpenRouter](https://openrouter.ai/) (Llama 3.3-70B)
- Database by [Cloudflare D1](https://developers.cloudflare.com/d1/)
- Confetti by [canvas-confetti](https://github.com/catdad/canvas-confetti)
- Screenshots by [html2canvas](https://html2canvas.hertzen.com/)
- AI Models: Meta Llama (3.1-8B primary, 3.3-70B backup)
- Predecessor: [Sim-Thailand 2569](https://thalay.eu/sim2569) by [thalay.eu](https://thalay.eu/)
