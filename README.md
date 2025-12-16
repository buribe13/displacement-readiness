# Displacement Readiness Dashboard

A situational awareness tool for housing and homelessness service organizations operating in Los Angeles, with an initial focus on Koreatown.

**Purpose:** Harm reduction and preparedness — helping organizations anticipate displacement pressure, coordinate outreach, and avoid reactive crisis response.

**This is a prototype/proposition, not a production system.**

---

## Ethical Foundation

This tool is built on explicit ethical principles:

### What This Tool Does
- Aggregates **public and delayed civic data** (sanitation schedules, event permits, road closures, transit disruptions)
- Provides **situational awareness** of institutional activity patterns
- Helps organizations **plan proactively** rather than respond reactively
- Supports **coordination** among service providers

### What This Tool Does NOT Do
- **Track individuals** or their locations
- Show **real-time law enforcement** positions
- Access **immigration enforcement** data
- **Predict** individual displacement events
- Serve data to the **general public**
- Replace **direct community engagement**

### Data Policy
- All data is **delayed by 24+ hours** or **simulated** (in this prototype)
- Data represents **institutional activity**, never individuals
- Geographic scope is **intentionally bounded** to Koreatown
- Every signal includes **interpretation context**, not just raw data

---

## Technical Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **shadcn/ui** components
- **Tailwind CSS** v4
- **Mapbox GL JS** for geospatial visualization

---

## Getting Started

### Prerequisites
- Node.js 20+
- npm (or pnpm if available)
- Mapbox account and access token

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd displacement-readiness

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your Mapbox token to .env.local
# NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here

# Start development server
npm run dev
```

### Accessing the Dashboard

The dashboard is **not publicly accessible** by design. To access it in development:

1. **Via the access page:** Visit `http://localhost:3000/access` and click "Enable Demo Access"
2. **Via browser cookie:** Set `org_access=1` cookie
3. **Via request header:** Include `x-org-access: 1` header

---

## Project Structure

```
displacement-readiness/
├── app/
│   ├── (protected)/           # Org-only routes
│   │   ├── dashboard/         # Main dashboard page
│   │   └── layout.tsx         # Protected layout with AppShell
│   ├── (public)/              # Public routes
│   │   └── access/            # Access required page
│   ├── api/
│   │   └── signals/           # Signal data endpoints
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Redirects to dashboard
├── components/
│   ├── dashboard/             # Dashboard-specific components
│   │   ├── MapPanel.tsx       # Koreatown map with signals
│   │   ├── SignalFeed.tsx     # Signal list with filters
│   │   └── ContextPanel.tsx   # Guidance and context
│   ├── shell/                 # Layout components
│   │   └── AppShell.tsx       # Main app wrapper
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── geo/
│   │   └── koreatown.ts       # Geographic constants
│   └── signals/
│       ├── types.ts           # Signal type definitions
│       └── mock.ts            # Simulated signal data
└── middleware.ts              # Org-only access gate
```

---

## API Endpoints

### GET /api/signals

Returns normalized civic signals for the dashboard.

**Query Parameters:**
- `kind` - Filter by signal type (sanitation, eventPermit, roadClosure, transitDisruption, displacementIndicator)
- `confidence` - Filter by confidence level (low, medium, high)
- `limit` - Maximum number of signals to return

**Response includes:**
- `signals` - Array of CivicSignal objects
- `meta` - Metadata including disclaimer, latency info, simulated flag

### GET /api/signals/summary

Returns aggregated statistics for dashboard overview.

**Response includes:**
- `byKind` - Signal counts by type
- `byConfidence` - Signal counts by confidence level
- `pressureLevel` - Aggregate pressure assessment (low, elevated, high)
- `pressureExplanation` - Human-readable explanation

---

## Signal Types

| Kind | Description | Example Sources |
|------|-------------|-----------------|
| `sanitation` | Scheduled cleanup activities | LA Sanitation |
| `eventPermit` | Large event permits | FilmLA, Special Events |
| `roadClosure` | Road closures, security perimeters | LADOT, LAPD |
| `transitDisruption` | Transit service changes | LA Metro |
| `displacementIndicator` | Historical patterns, aggregated trends | 311 data, surveys |

---

## Expanding to Other Neighborhoods

The architecture supports adding other LA neighborhoods. To add a new area:

1. Create a new file in `lib/geo/` with boundary constants
2. Update the geographic filter in API routes
3. Add neighborhood selector to the UI (if multi-neighborhood view is desired)

**Important:** Each neighborhood addition should be a deliberate choice with community input, not automatic scaling. The bounded geographic scope is an intentional ethical constraint.

---

## Production Considerations

Before deploying to production:

1. **Authentication:** Replace the prototype cookie gate with proper authentication (NextAuth, Clerk, etc.)
2. **Data Sources:** Connect to real civic data APIs with appropriate delays
3. **Access Logging:** Implement audit logging for accountability
4. **Community Review:** Have the tool reviewed by affected communities and advocacy organizations
5. **Legal Review:** Ensure compliance with data privacy regulations
6. **Rate Limiting:** Implement rate limiting on API routes

---

## Design Decisions

### Why Koreatown-bounded?
- Prevents "surveillance creep" toward city-wide monitoring
- Keeps focus on community-level situational awareness
- Allows affected community to verify tool respects boundaries

### Why delayed data?
- Prevents use as real-time targeting tool
- Shifts focus from reaction to planning
- Maintains separation from enforcement activities

### Why muted colors?
- Avoids alarming visuals that suggest emergency response
- Supports calm, deliberate planning rather than panic
- Respects that this is a planning tool, not an alert system

### Why org-only access?
- Protects vulnerable populations from misuse
- Ensures tool serves intended purpose
- Enables accountability and trust

---

## License

[Add appropriate license]

---

## Acknowledgments

Built with consideration for the communities this tool is designed to serve. The design prioritizes harm reduction over surveillance, awareness over control, and community trust over technical capability.

---

*This is a prototype for demonstration and discussion purposes. All data displayed is simulated.*
