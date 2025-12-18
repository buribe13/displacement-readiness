# Outreach Window Planner

A temporal planning tool for housing and homelessness outreach organizations in Los Angeles, with an initial focus on Koreatown.

## Core Concept

This tool reframes displacement as a **temporal coordination problem**, not a spatial one.

Instead of asking _where_ harm occurs, it helps organizations understand _when_ care can be delivered with less disruption.

## Design Philosophy

### Time Over Space

- **Timeline is the primary interface** - not maps
- We model temporal rhythms (sanitation cycles, events, shelter hours)
- Geography is contextual, not central

### Harm Reduction Through Timing

- Identify low-disruption windows for effective outreach
- Understand when multiple disruptive signals overlap
- Plan proactively, not reactively

### Ethical Safeguards

- **No real-time data** - all data is delayed 24h+ or simulated
- **No individual tracking** - signals represent institutional activity only
- **No enforcement guidance** - this is a coordination tool, not a surveillance system
- **Transparent limitations** - disclaimers are built into every view

## Target Users

This is an **organization-only** planning tool designed for:

- Outreach coordinators
- Case managers
- Volunteer organizers
- Program directors

**This is not a public-facing app.**

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **shadcn/ui** for all UI components
- **Tailwind CSS**
- Server Components where appropriate
- API Routes for aggregating temporal data

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

## Project Structure

```
app/
├── page.tsx                    # Landing page with ethical framing
├── planner/
│   ├── page.tsx               # Main planner (server component)
│   ├── PlannerClient.tsx      # Client interactivity
│   └── layout.tsx             # Planner shell
├── api/
│   └── temporal/
│       ├── signals/route.ts   # Temporal signals API
│       ├── windows/route.ts   # Computed windows API
│       └── scenario/route.ts  # Speculative scenario API

components/
├── planner/
│   ├── TimelineView.tsx       # Primary timeline interface
│   ├── OverlapViewer.tsx      # Signal overlap visualization
│   ├── GuidancePanel.tsx      # Non-prescriptive planning guidance
│   └── ContextualMapView.tsx  # Optional secondary map view
├── shell/
│   └── PlannerShell.tsx       # App shell with ethics reminders
└── ui/                        # shadcn/ui components

lib/
├── temporal/
│   ├── types.ts               # Temporal signal types
│   ├── mock.ts                # Simulated temporal data
│   └── aggregate.ts           # Window computation logic
└── utils.ts                   # Utility functions
```

## Data Model

Temporal signals include:

- `signalType`: sanitationCycle, publicEvent, shelterIntakeHours, transitDisruption, serviceBottleneck
- `timeRange`: start/end with LA timezone
- `impactLevel`: low/medium/high (on outreach effectiveness)
- `confidenceLevel`: low/medium/high (data reliability)
- `interpretationNotes`: Plain-language context
- `dataLatencyHours`: How delayed the data is (always 24h+)
- `isSimulated`: Boolean flag (true for all prototype data)

## Core Features

### 1. Outreach Window Timeline (Primary)

Vertical time-based visualization showing:

- "Safer outreach windows"
- "High disruption periods"
- Contributing signals and explanations

### 2. Signal Overlap Viewer

Shows when multiple disruptive signals overlap, with:

- Plain-language explanations of compound effects
- Coordination suggestions

### 3. Planning Guidance Panel

Non-prescriptive suggestions including:

- Timing strategies per window type
- Coordination ideas
- General best practices

### 4. Scenario Mode (Speculative)

Simulate major events (e.g., Olympics) to see:

- How outreach windows compress
- Which periods become more challenging
- **Clearly labeled as speculative**

### 5. Contextual Map (Optional Secondary)

De-emphasized geographic context:

- Generalized areas only
- Not the primary interface
- Works without Mapbox token (text fallback)

## Ethical Design

### What This Tool Does NOT Do

- ❌ Track individuals or their locations
- ❌ Show real-time data
- ❌ Display law enforcement activity
- ❌ Provide enforcement guidance
- ❌ Predict individual outcomes

### Built-in Safeguards

- Persistent "Simulated Data" and "24h+ Delay" badges
- "About & Ethics" dropdown in header
- Footer disclaimers on every view
- Inline code comments explaining ethical decisions
- API responses include mandatory disclaimer field

## UI Tone

- **Calm**: Muted colors, no alarming visuals
- **Operational**: Clear, actionable information
- **Accessible**: WCAG 2.1 AA compliant
- **Trustworthy**: Transparent about limitations

## Environment Variables

```bash
# Optional: Mapbox token for map tab (works without it)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxxxx

# Optional: Base URL for API calls in server components
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Prototype Status

This is a **prototype of a proposition**, not a production system.

Prioritizes:

- Clarity and safety over feature completeness
- Explainable logic over complex algorithms
- Ethical guardrails over convenience

## Why This Approach

Traditional displacement tools often center maps and location—which can enable surveillance.

By centering **time**, we:

- Shift focus to coordination, not tracking
- Enable planning without enabling harm
- Respect individual autonomy
- Support organizational judgment

## License

This project is for educational and demonstration purposes.

---

_The Outreach Window Planner reframes displacement as a temporal coordination problem. Instead of asking where harm occurs, it helps organizations understand when care can be delivered with less disruption._
