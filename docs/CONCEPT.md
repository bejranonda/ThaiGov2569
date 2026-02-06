# Sim-Government: Thailand 2569 -- Project Concept

## Project Overview

**Sim-Government: Thailand 2569** is an interactive political simulation game that lets players experience the process of forming and running a Thai government. It is the second installment in the **"Thai Election 2569"** series, designed to engage citizens with the democratic process through gameplay.

**Version:** 0.2.0
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
- **Core Experience:** Players take on the role of a political leader who must form a coalition government, select key policies, appoint cabinet ministers, and then govern through AI-powered conversations with government and opposition voices
- **Outcome:** An open-ended simulation where players discover the complexities of governing -- coalition mathematics, policy trade-offs, and political dynamics
- **Purpose:** Deepens understanding of how governments form and function after an election
- **Tech:** React 18, Cloudflare Workers AI, light governmental theme
- **URL:** https://simgov2569.autobahn.bot

### Narrative Connection

The games are linked by a simple but powerful narrative:

> *"You explored the policies. You found your party. The election is over. Now it's your turn to form the government and lead the country."*

The intro screen of Sim-Government explicitly references Sim-Thailand through a "sequel badge" linking to the predecessor, establishing continuity for returning players while remaining accessible to newcomers.

---

## Game Design Philosophy

### 1. Real Data, Real Engagement

Both games use **authentic political party data** from the 2569 Thai election cycle. Policy positions, party platforms, seat counts, and ministry structures are sourced from official party websites, the Nation Election Debate (17 January 2569), and other verified political coverage. This grounding in reality makes the simulation educational rather than fictional.

### 2. Learning Through Interaction

Rather than presenting information passively (articles, infographics), the series uses **interactive simulation** to create understanding. When a player struggles to form a coalition with enough seats, they viscerally understand the challenge of parliamentary mathematics. When they must choose between competing policies, they experience the trade-offs that real governments face.

### 3. Accessible Complexity

The game progressively introduces complexity through its 4-step flow:
1. **Coalition Building** -- Binary choice (include/exclude parties), simple arithmetic (reach 250 seats)
2. **Policy Selection** -- Browse and select from categorized policies, introducing policy diversity
3. **Cabinet Allocation** -- Map parties to ministries, introducing institutional structure
4. **Government Chat** -- Open-ended AI conversation, introducing political discourse and opposition dynamics

Each step builds on the previous one, gradually increasing engagement depth without overwhelming the player at any point.

### 4. No Winners, No Losers

Unlike Sim-Thailand which produces a ranked party match (a "result"), Sim-Government is deliberately **open-ended**. There is no score, no pass/fail, no optimal path. The value is in the experience of governing itself -- the conversations with AI ministers, the discovery of policy implications, the political dynamics between coalition and opposition.

---

## UX Design Decisions

### Light Theme (vs. Dark in Sim-Thailand)

Sim-Thailand uses a dark space/cyberpunk aesthetic (slate-950 background, neon glows, floating astronaut). Sim-Government deliberately uses a **light, governmental theme** (slate-50 to blue-50 gradients, white cards, professional typography) for two reasons:
1. **Visual differentiation** -- Immediately signals this is a different game/phase
2. **Tonal appropriateness** -- A light, clean aesthetic feels more "official" and "governmental," matching the serious theme of forming a real government

### Party-Colored Selection Feedback

When players select a party in the coalition builder, the card highlights in **that party's own color** (red for Pheu Thai, orange for People's Party, etc.) rather than a generic blue. This creates:
- Stronger visual association between party identity and player choice
- A more colorful, dynamic coalition-building experience
- Visual reinforcement of the multi-party nature of Thai politics

### Step Progress Indicator

A 4-dot progress bar with connecting lines shows where the player is in the game flow. This addresses a common UX concern in multi-step processes: *"How much more is there?"* The indicator uses:
- **Blue filled dots** for the current step
- **Green filled dots** with checkmarks for completed steps
- **Gray dots** for upcoming steps

### Animated Intro with Sequel Badge

The intro screen uses staggered entrance animations (elements appearing sequentially) to create a cinematic welcome. The "sequel badge" linking to Sim-Thailand serves dual purposes:
- For returning players: Establishes continuity and narrative progression
- For new players: Provides a link to explore the predecessor for additional context

### Category Filter Counts

In the policy selection step, each category pill shows the number of available policies (e.g., "Economy (8)"). This helps players understand the breadth of options available and discover categories they might otherwise overlook.

---

## Target Audience

### Primary: Thai Voters (Post-Election)

The primary audience is Thai citizens who have recently voted (or will soon vote) in the 2569 election. The game provides a meaningful way to stay engaged with politics after election day, understanding what happens next in the democratic process.

### Secondary: Civics Education

Teachers and educators can use both games as interactive teaching tools for:
- Understanding parliamentary democracy
- Learning about coalition politics
- Exploring policy trade-offs
- Discussing the role of government institutions (ministries, cabinet)

### Tertiary: Political Enthusiasts

Anyone interested in Thai politics, comparative government, or political simulation games will find value in the realistic party data and AI-powered governance experience.

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

### Backend
- **Cloudflare Pages Functions** (serverless)
- **Cloudflare Workers AI** (Llama 3.1-8B) for primary AI responses
- **OpenRouter** (Llama 3.3-70B) as automatic fallback
- **Cloudflare D1** (SQLite) for simulation data persistence

### Key Design Patterns
- Single-component architecture (`App.jsx`) with render functions per step
- State machine pattern (step 0-4) for game flow control
- Party color mapping (`PARTY_STYLES`) for consistent party-colored UI
- Dual AI response pattern (PM + Opposition) for balanced political discourse

---

## Future Considerations

- **Results/Summary Screen**: After the chat phase, show a summary of the government formed (coalition composition, policy platform, cabinet structure)
- **Sharing**: Allow players to share their government configuration on social media
- **Multiplayer Debate**: Let two players form competing coalitions and debate
- **Historical Comparison**: Compare player's government with actual government formations
- **Localization**: English version for international audience interested in Thai politics

---

*Sim-Government: Thailand 2569 is developed by [thalay.eu](https://thalay.eu/) as part of the Thai Election 2569 educational simulation series.*
