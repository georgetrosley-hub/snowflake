# Anthropic Enterprise Expansion OS

A premium, Anthropic-branded, dark-mode web app simulating how multiple Claude agents help an enterprise account executive land and expand Claude inside Fortune 500 companies. Built to feel like an internal Anthropic product prototype with production-level design polish.

## How to run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
├── app/
│   ├── context/          # App state and simulation
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── layout/           # Sidebar, status bar
│   ├── sections/         # Command Center, Live Feed, Org Map, etc.
│   └── ui/               # Reusable cards, metrics
├── data/
│   ├── accounts.ts       # Target account mock data
│   ├── agents.ts         # Nine Claude agent definitions
│   └── competitors.ts    # Competitor data and account-specific risk
├── lib/
│   ├── simulation.ts     # Deterministic event/approval engine
│   └── utils.ts
└── types/
    └── index.ts          # Shared TypeScript types
```

## Where to edit

### Account data
**`data/accounts.ts`** — Add or modify target accounts. Each account includes:
- Employee count, developer population, AI maturity
- Security/compliance/competitive metrics
- Executive sponsors, first wedge, land/expansion values
- Top blockers and expansion paths

### Agent behavior
**`data/agents.ts`** — Define the nine agents (Territory Intelligence, Research, Competitive Strategy, Technical Architecture, Security and Compliance, Legal and Procurement, Executive Narrative, Expansion Strategy, Human Oversight).

**`lib/simulation.ts`** — Edit event and approval templates per account. Add new event types in `EVENT_TEMPLATES` and approval prompts in `APPROVAL_TEMPLATES`. Event generation is deterministic (based on account ID and tick).

### Styling and theme
**`tailwind.config.ts`** — Color palette: `surface`, `text`, `accent`. Warm charcoal (`#1a1816`), soft ivory (`#f5f2ef`), muted clay/bronze (`#b8a88a`).

**`app/globals.css`** — CSS variables and base styles.

## Tech stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- Recharts

No backend or API calls. Simulation runs locally and deterministically for stable demos.
