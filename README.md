# WanderCanvas — Collaborative, Hygiene-Aware AI Travel Planning Platform 🌍✨

[![Live Demo](https://img.shields.io/badge/Live_Demo-wandercanv.netlify.app-244536?style=for-the-badge&logo=netlify&logoColor=white)](https://wandercanv.netlify.app/)
[![GitHub repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Avadhut-Pawar31/WanderCanvas)
[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> 🌐 **Live Web Application**: [**https://wandercanv.netlify.app/**](https://wandercanv.netlify.app/)  
> *"Less planning. More wondering."*

**WanderCanvas** is a production-oriented, collaborative travel-planning platform that helps travelers plan journeys, discover suitable routes, evaluate verified hygiene evidence along highway and scenic corridors, find clean washrooms, and collaborate with friends in real time.

---

## 🔗 Direct Access & Links
- **Live Deployment**: [https://wandercanv.netlify.app/](https://wandercanv.netlify.app/)
- **Featured Journey (Mahabaleshwar + Kaas Plateau)**: [https://wandercanv.netlify.app/workspace/trip-mahabaleshwar-kaas](https://wandercanv.netlify.app/workspace/trip-mahabaleshwar-kaas)
- **Reference Trip (Amalfi Coast Classic)**: [https://wandercanv.netlify.app/workspace/trip-amalfi-classic](https://wandercanv.netlify.app/workspace/trip-amalfi-classic)
- **Global Destinations Explore**: [https://wandercanv.netlify.app/explore](https://wandercanv.netlify.app/explore)

---

## 🏛️ Core Product Architecture & Pillars

Unlike generic itinerary generators, WanderCanvas provides an authentic travel platform built around two core pillars:
1. **Hygiene Intelligence**: Objective, evidence-backed inspection records and facility checklists (water, soap, odor, accessibility, flush functionality) rather than subjective star ratings.
2. **Collaborative Planning Workspaces**: Real-time shared itineraries, proposal voting with consensus auto-promotion, trip-scoped group chat, and route corridor discovery.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          WanderCanvas Platform                         │
├───────────────────┬───────────────────┬────────────────────────────────┤
│  Route & Geospatial│  Hygiene & Audit  │   Collaboration & Workspace    │
│  • Haversine &    │  • 0-100 Checklist│   • Multi-Tab Real-time Sync   │
│    Perpendicular  │    Scoring Engine │   • Invite Codes (e.g. AMALFI) │
│    Detour Math    │  • 90-Day Freshness│   • Owner/Editor/Viewer Roles  │
│  • Dual Renderer: │    Expiry Rule    │   • Proposal Voting (+1 / -1)  │
│    Google Maps +  │  • Evidence Status│   • Consensus Auto-Promotion   │
│    Geospatial SVG │  • Community Logs │   • Trip-Scoped Live Chat      │
├───────────────────┴───────────────────┴────────────────────────────────┤
│                    Grounded AI Travel Assistant                        │
│  • Grounded in actual corridor geometry & verified inspection logs     │
│  • Evaluates detour minutes, water/soap supplies, and accessibility    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

### 1. Interactive Route & Detour Engine (`services/mapRouteService.ts`)
- **Corridor Discovery**: Computes driving, transit, bicycling, or walking route paths between origins and destinations.
- **Accurate Detour Math**: Computes perpendicular distance and realistic driving detour (+km, +mins) from route geometry to candidate places.
- **Dual-Engine Map Rendering (`components/map/InteractiveRouteMap.tsx`)**:
  - Full Google Maps JavaScript API integration when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is provided.
  - Built-in vector geospatial SVG/Canvas renderer with interactive markers and detour polylines when running offline or without credentials.

### 2. Hygiene Intelligence & Place Audits (`services/hygieneService.ts`)
- **Transparent Scoring Formula (0–100)**:
  - Visible Cleanliness (25%)
  - Running Water Supply (20%)
  - Functional Flush / Toilet Condition (20%)
  - Soap Availability (15%)
  - Odor Neutrality (10%)
  - Waste Disposal Maintenance (10%)
- **Strict Verification Statuses**:
  - `officially_inspected` — Audited on-site by municipal or health boards.
  - `independently_inspected` — Verified by certified sanitation auditors.
  - `community_reported` — Recent reports from verified travelers.
  - `not_yet_verified` — Unknown locations (never assigned fabricated scores).
  - `verification_expired` — Automatically flags any inspection older than 90 days.
- **Detailed Audit Modal (`components/hygiene/HygieneReportModal.tsx`)**: Inspect facilities, touchless amenities, step-free access, baby changing stations, and submit community reports.

### 3. Collaborative Trip Workspace (`services/collaborationService.ts`, `app/workspace/[id]/page.tsx`)
- **Trip Membership & Roles**: Secure invite codes (e.g. `AMALFI-26`), with roles (`owner`, `editor`, `viewer`).
- **Synchronized Shared Itinerary**: Real-time cross-tab updates using the HTML5 `BroadcastChannel` API and persistent local storage.
- **Democratic Stop Voting**: Members can propose stops with rationales; receiving consensus (+2 net upvotes) auto-promotes the candidate place to confirmed route waypoints.
- **Persistent Trip Chat (`services/chatService.ts`, `components/chat/TripChatPanel.tsx`)**: Trip-scoped real-time messaging with attached place cards and automated itinerary change alerts.

### 4. Grounded AI Travel Assistant (`services/aiAssistantService.ts`)
- Uses validated candidate places and route geometry.
- Enforces strict hygiene filters (e.g., verified-only, clean washrooms, dining, lodging).
- Transparently reports detour minutes and inspection certificate IDs.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) with Turbopack
- **Language**: [TypeScript 5](https://www.typescriptlang.org/) (Strict typing, zero lint errors)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with an editorial palette (Warm Ivory `#F7F5EF`, Forest Green `#244536`, Terracotta `#C78363`)
- **Typography**: Playfair Display (Serif) + Inter (Sans)
- **Animation**: [Framer Motion 12](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Forms & Validation**: React Hook Form + Zod
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

---

## 📦 Getting Started

### Prerequisites

- Node.js 18+ (tested on Node v20 & v25)
- npm or yarn

### 1. Installation

```bash
git clone https://github.com/Avadhut-Pawar31/WanderCanvas.git
cd WanderCanvas
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure your API keys in `.env.local`:

```env
# Optional: Google Maps Platform API key (for Google satellite/vector map tiles)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY

# Optional: Google Gemini API key (for AI travel assistant completions)
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
NEXT_PUBLIC_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

> **Note**: WanderCanvas includes full built-in mock/corridor data and SVG geospatial projection, so you can explore all features (interactive maps, hygiene inspections, voting, chat, AI suggestions) **without requiring external API keys**.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the active port displayed in terminal) to view the application.

---

## 🧪 Testing & Verification

Run the comprehensive automated platform verification suite:

```bash
npm test
```

This verifies:
1. **Geospatial & Route Detour Calculations**: Haversine distance, route corridor geometry, and detour penalties.
2. **Hygiene Checklist & Scoring Formula**: 0-100 weighted checklist calculation and deficient penalties.
3. **Verification Freshness & 90-Day Expiry**: Enforces the 90-day inspection expiration rule and ensures unverified places have no fabricated scores.
4. **Community Reporting**: Submission, validation, and indexing of traveler reports.
5. **Collaborative Workspace & Voting**: Creation, invite code joining, proposal voting, and consensus auto-promotion to waypoints.
6. **AI Assistant Route Grounding**: Verifies assistant recommendations match corridor route data and verified evidence.

To run linting and production build checks:

```bash
npm run lint    # Zero ESLint errors
npm run build   # Production Turbopack compilation & static generation
```

---

## 🗺️ Google Cloud Platform Configuration

When connecting your production Google Cloud project:

1. **Enable Google Cloud APIs**:
   - **Maps JavaScript API**: Map rendering and controls.
   - **Places API (New)**: Place search, autocomplete, and details.
   - **Routes API**: Polylines, travel distances, and duration calculations.
   - **Geocoding API**: Address to lat/lng lookup.

2. **API Key Security & Restrictions**:
   - Go to **Google Cloud Console > APIs & Services > Credentials**.
   - Create a Browser API Key.
   - Set **Application restrictions** to **HTTP referrers (web sites)**:
     - `http://localhost:3000/*` (local dev)
     - `https://your-domain.com/*` (production)
   - Set **API restrictions** to:
     - Maps JavaScript API
     - Places API
     - Routes API

---

## 📂 Project Directory Structure

```
WanderCanvas/
├── app/
│   ├── layout.tsx                     # Playfair Display + Inter font setup
│   ├── globals.css                    # Tailwind v4 theme tokens
│   ├── page.tsx                       # Editorial landing page
│   ├── my-trips/                      # Collaborative trips listing & join modal
│   ├── workspace/[id]/                # Master collaborative trip workspace
│   ├── home/                          # Trip intake form & generator
│   ├── explore/                       # Curated destinations
│   ├── login/ & signup/               # Authentication pages
│   └── mood-boards/                   # Visual travel boards
├── components/
│   ├── map/
│   │   └── InteractiveRouteMap.tsx    # Dual Google Maps / Vector SVG corridor map
│   ├── hygiene/
│   │   └── HygieneReportModal.tsx     # Inspection audit logs & community reporter
│   ├── collaboration/
│   │   └── SharedItineraryPanel.tsx   # Sequential stops & proposal voting
│   ├── chat/
│   │   └── TripChatPanel.tsx          # Real-time trip chat & place cards
│   ├── ai/
│   │   └── AITravelAssistantPanel.tsx # Grounded route & hygiene recommendations
│   ├── workspace/
│   │   └── TripWorkspaceView.tsx      # Master unified workspace tabs
│   └── ui/                            # Buttons, inputs, dialogs
├── services/
│   ├── mapRouteService.ts             # Haversine, detour, and corridor math
│   ├── hygieneService.ts              # Checklist scoring, freshness & seed data
│   ├── collaborationService.ts        # Trips, invite codes, roles & voting
│   ├── chatService.ts                 # Real-time messaging
│   └── aiAssistantService.ts          # Grounded AI planning engine
├── scripts/
│   └── verify-platform.ts             # Automated platform test suite
├── types/
│   └── index.ts                       # Domain TypeScript interfaces
├── .env.example                       # Environment configuration template
└── package.json                       # Scripts and dependencies
```

---

## 🛡️ Security & Privacy Principles

- **No Fabricated Evidence**: Places without genuine municipal or auditor reports are explicitly labeled `Evidence Pending` or `not_yet_verified`.
- **Credential Protection**: Client API keys are restricted by HTTP referrer; server keys never touch browser bundles.
- **Client Sanitization**: All user notes, suggestions, and chat inputs are validated before inclusion in storage or messages.
- **Role Enforcement**: Viewers cannot propose stops or modify route parameters.

---

## 📄 License

MIT &copy; WanderCanvas
