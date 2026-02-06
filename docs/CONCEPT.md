# Sim-Government: Thailand 2569 -- Project Concept

## Project Overview

**Sim-Government: Thailand 2569** is an interactive political simulation game that lets players experience the full lifecycle of forming and running a Thai government. It is the second installment in the **"Thai Election 2569"** series, designed to engage citizens with the democratic process through gameplay.

**Version:** 0.3.0
**Platform:** Web (React + Tailwind CSS)
**Live:** https://simgov2569.autobahn.bot

---

## The Election Series

The "Thai Election 2569" series consists of two complementary games that together cover the full arc of a democratic election cycle:

### Part 1: Sim-Thailand 2569 (Pre-Election)

- **Timing:** Designed for the period *before* the election
- **Core Experience:** Players navigate 6 urgent national issues (economy, agriculture, welfare, anti-corruption, security, education) by selecting their preferred policy approaches
- **Outcome:** The game matches players with the political party whose platform most closely aligns with their choices, presented as a percentage match across 18 real parties
- **Purpose:** Helps voters explore and understand the policy landscape before casting their vote
- **Tech:** Vanilla JavaScript, Firebase backend, dark cyberpunk theme
- **URL:** https://thalay.eu/sim-thailand

### Part 2: Sim-Government: Thailand 2569 (Post-Election)

- **Timing:** Designed for the period *after* the election
- **Core Experience:** Players take on the role of a political leader who must form a coalition government, select key policies within a budget, appoint cabinet ministers, govern through AI-powered conversations, and receive a scored evaluation of their performance
- **Outcome:** A complete simulation with measurable outcomes -- coalition stability score, policy diversity rating, cabinet expertise assessment, engagement level, and an overall letter grade
- **Purpose:** Deepens understanding of how governments form and function after an election, with quantifiable feedback on decision quality
- **Tech:** React 18, Cloudflare Workers AI, light governmental theme
- **URL:** https://simgov2569.autobahn.bot

### Narrative Connection

The games are linked by a simple but powerful narrative:

> *"You explored the policies. You found your party. The election is over. Now it's your turn to form the government and lead the country. How well will you govern?"*

The intro screen of Sim-Government explicitly references Sim-Thailand through a "sequel badge" linking to the predecessor, establishing continuity for returning players while remaining accessible to newcomers.

---

## Game Design Philosophy

### 1. Real Data, Real Engagement

Both games use **authentic political party data** from the 2569 Thai election cycle. Policy positions, party platforms, seat counts, and ministry structures are sourced from official party websites, the Nation Election Debate (17 January 2569), and other verified political coverage. This grounding in reality makes the simulation educational rather than fictional.

### 2. Learning Through Interaction

Rather than presenting information passively (articles, infographics), the series uses **interactive simulation** to create understanding:
- When a player struggles to form a coalition with enough seats, they viscerally understand the challenge of parliamentary mathematics
- When they must choose between competing policies within a budget, they experience real trade-offs that governments face
- When they receive a low score on cabinet expertise, they learn the importance of matching ministers to their strengths
- When they see their grade compared to other players, they understand the relative difficulty of different paths

### 3. Progressive Complexity with Scoring

The game progressively introduces complexity through its 5-step flow:

1. **Coalition Building** -- Binary choice (include/exclude parties), simple arithmetic (reach 250 seats)
2. **Policy Selection** -- Budget system (max 10 policies), accordion categories, introducing resource constraints
3. **Cabinet Allocation** -- Map parties to ministries, introducing institutional structure and expertise matching
4. **Government Chat** -- Open-ended AI conversation, introducing political discourse and opposition dynamics
5. **Results & Scoring** -- Quantified feedback across 4 dimensions, letter grade, aggregate comparison

Each step builds on the previous one, gradually increasing engagement depth while providing clear feedback loops.

### 4. Measurable Outcomes

Unlike v0.2.0 which was deliberately open-ended, v0.3.0 introduces a **scoring system** that gives players concrete feedback on their decisions while maintaining multiple valid paths:

- **Coalition Stability (25 pts)**: Rewards secure margins above the 250-seat threshold
- **Policy Diversity (25 pts)**: Rewards breadth across issue categories
- **Cabinet Expertise (25 pts)**: Rewards matching ministers to parties with relevant policy platforms
- **Engagement (25 pts)**: Rewards thorough exploration through chat

The grade scale (A-F) provides immediate, intuitive feedback while the breakdown shows where players excelled or struggled.

### 5. Celebration & Social Proof

- **Confetti Moment**: A party-colored celebration when entering government creates a sense of achievement
- **Aggregate Stats**: Public leaderboards show PM distribution, grade distribution, and averages -- giving players context for their performance
- **Results Without Playing**: The "ดูผลโหวต" button lets curious visitors see aggregate data without committing to a full game

---

## UX Design Decisions

### Light Theme (vs. Dark in Sim-Thailand)

Sim-Thailand uses a dark space/cyberpunk aesthetic (slate-950 background, neon glows, floating astronaut). Sim-Government deliberately uses a **light, governmental theme** (slate-50 to blue-50 gradients, white cards, professional typography) for two reasons:
1. **Visual differentiation** -- Immediately signals this is a different game/phase
2. **Tonal appropriateness** -- A light, clean aesthetic feels more "official" and "governmental," matching the serious theme of forming a real government

### Policy Budget System

The shift from "choose 3+ policies" to "budget of 10 policies" creates meaningful decision pressure:
- **Resource constraint**: Players cannot select everything they want
- **Trade-offs**: Choosing one policy often means excluding another
- **Visual feedback**: Dot meter provides constant budget awareness
- **Exhaustion moment**: When budget hits 0, cards become disabled -- creating a clear "no more" moment

### Accordion Categories

Replacing the flat grid with collapsible accordions addresses the overwhelming nature of 132 policies:
- **Cognitive load**: Players see categories first, policies second
- **Progressive disclosure**: Only expanded category shows its policies
- **Counts and badges**: "เลือกแล้ว X" badges help players track selections per category
- **Search exception**: When searching, flat layout returns for filtered results

### Sticky Header

The always-visible header serves three critical purposes:
- **Budget awareness**: Players always know their remaining budget
- **Navigation**: Back button and next button always accessible
- **Progress**: Counter shows policies selected vs maximum

### Cabinet Reshuffle Limit

Limiting reshuffles to 2 prevents decision paralysis while allowing some correction:
- **Consequences matter**: Players must live with most choices
- **Limited correction**: 2 reshuffles allow fixing critical mistakes
- **Visual counter**: Dot tracker shows remaining opportunities

### Clickable Step Indicator

Making completed steps clickable enables backward navigation without breaking the forward narrative:
- **Correction**: Players can go back and adjust earlier decisions
- **Exploration**: Encourages experimentation with different combinations
- **Reshuffle cost**: Going back to cabinet costs a reshuffle slot (when coming from chat/results)

### Brand-aligned Favicon

To provide a professional and cohesive experience from the browser tab to the app content:
- **Visual Consistency**: The favicon uses the same `Landmark` icon and blue-to-indigo gradient as the Hero icon in the intro screen.
- **Modern SVG**: Using a high-quality SVG format ensures the icon remains crisp across all resolutions and device types.

---

## Scoring System Rationale

The 100-point scoring system balances multiple dimensions of governance quality:

### Coalition Stability (25 pts)
- **Formula**: Margin above 250 seats, capped at 100 extra
- **Rationale**: Secure governments govern more effectively; runaway majorities (>350 seats) don't earn additional points
- **Lesson**: Parliamentary stability matters, but excessive dominance isn't the goal

### Policy Diversity (25 pts)
- **Formula**: Unique categories covered / 10 total categories
- **Rationale**: Governments with broader policy portfolios address more citizen needs
- **Lesson**: Narrow policy focus limits impact; breadth is valuable

### Cabinet Expertise (25 pts)
- **Formula**: Party has relevant policy platform for assigned ministry / 8 ministries
- **Rationale**: Ministers with relevant policy backgrounds govern more effectively
- **Lesson**: Personnel assignments should match expertise

### Engagement (25 pts)
- **Formula**: Chat messages sent, capped at 10
- **Rationale**: Thorough exploration of governance issues leads to better understanding
- **Lesson**: Engagement matters; the game rewards curiosity

The grade scale provides intuitive feedback: A (90+) = excellent, B (75+) = good, C (60+) = adequate, D (40+) = poor, F (<40) = failing.

---

## Target Audience

### Primary: Thai Voters (Post-Election)

The primary audience is Thai citizens who have recently voted (or will soon vote) in the 2569 election. The game provides a meaningful way to stay engaged with politics after election day, understanding what happens next in the democratic process. The scoring system gives them a sense of how their choices compare to others.

### Secondary: Civics Education

Teachers and educators can use both games as interactive teaching tools for:
- Understanding parliamentary democracy and coalition mathematics
- Learning about policy trade-offs and budget constraints
- Exploring the role of government institutions (ministries, cabinet)
- Discussing governance quality and decision-making under constraints

### Tertiary: Political Enthusiasts

Anyone interested in Thai politics, comparative government, or political simulation games will find value in the realistic party data, AI-powered governance experience, and competitive scoring.

---

## Data Sources

| Source | Usage |
|--------|-------|
| Nation Election Debate (17 Jan 2569) | Party policy positions, debate quotes |
| Official party websites (PTP, PP, BJT, etc.) | Platform details, policy specifics |
| The Standard News (Economic Battle) | Economic policy comparisons |
| Thai PBS (Policy Watch) | Health and social policy details |
| Parliament of Thailand | Seat counts, ministry structure |
| Pride Vote Forum | Social equality policies |

All data is used for educational and simulation purposes only, as stated in the in-app disclaimer.

---

## Technical Architecture

### Frontend
- **React 18** with functional components and hooks
- **Tailwind CSS** for utility-first styling with custom animation extensions
- **Lucide React** for consistent iconography
- **Anuphan** Thai font (Google Fonts) for professional Thai typography
- **canvas-confetti** (code-split, ~11KB) for celebration effects

### Backend
- **Cloudflare Pages Functions** (serverless)
- **Cloudflare Workers AI** (Llama 3.1-8B) for primary AI responses
- **OpenRouter** (Llama 3.3-70B) as automatic fallback
- **Cloudflare D1** (SQLite) for simulation data persistence with scoring metrics

### Key Design Patterns
- Single-component architecture (`App.jsx`) with render functions per step
- State machine pattern (step 0-5) for game flow control
- Party color mapping (`PARTY_STYLES`) for consistent party-colored UI
- Budget enforcement at interaction level (togglePolicy blocks selection)
- Scoring calculation on-demand (calculateScore called when needed)
- Session save on completion (saveSession fires on "จบบริหาร" click)

---

## What's Next: Future Considerations

### Completed in v0.3.0
- ✅ Results/Summary screen with scoring
- ✅ Aggregate stats and leaderboards
- ✅ Policy budget system for meaningful trade-offs
- ✅ Cabinet reshuffle limits
- ✅ Celebration moment (confetti)

### Potential Future Features
- **Social Sharing**: Allow players to share their government configuration and score on social media
- **Multiplayer Debate**: Let two players form competing coalitions and debate
- **Historical Comparison**: Compare player's government with actual government formations after the real election
- **Policy Impact Simulation**: Show how chosen policies affect metrics over time
- **Localization**: English version for international audience interested in Thai politics
- **Minigames**: Mini-challenges for specific policy areas (e.g., budget balancing, crisis response)

---

## Version History

| Version | Date | Major Changes |
|---------|------|---------------|
| 0.1.0 | Initial | Basic game flow (4 steps), AI chat, data persistence |
| 0.2.0 | Jan 2025 | Intro screen, step indicator, party colors, animations, Sim-Thailand connection |
| 0.3.0 | Feb 2025 | Policy budget, accordion, cabinet reshuffle limit, confetti, scoring system, results screen, aggregate stats |

---

*Sim-Government: Thailand 2569 is developed by [thalay.eu](https://thalay.eu/) as part of the Thai Election 2569 educational simulation series.*
