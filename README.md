# ClaimsFlow AI

AI-powered vehicle insurance claims processing platform with intelligent FNOL, predictive triage, and real-time status tracking.

## Features

### 🤖 Screen 1: Intelligent FNOL Agent
- Conversational AI interface with dynamic questioning
- Real-time policy verification and data enrichment
- Smart photo upload with AI damage detection
- Emotional state detection and escalation handling

### 📊 Screen 2: Triage & Assignment Dashboard
- Multi-dimensional claim scoring (Complexity, Severity, Fraud Risk, Customer Value, Urgency)
- AI-powered routing recommendations
- Straight-Through Processing (STP) identification
- Estimated resolution timelines

### 📱 Screen 3: Claim Status Portal
- Visual progress timeline
- Real-time notification feed
- Assigned adjuster information
- Self-service claim tracking

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand with localStorage persistence
- **Icons:** Lucide React
- **Deployment:** Vercel-ready

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/
│   ├── chat/              # FNOL chat components
│   ├── triage/            # Triage dashboard components
│   └── status/            # Status portal components
├── store/                 # Zustand state management
└── types/                 # TypeScript type definitions
```

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Mactavish28/claimsflow-ai)

1. Push to GitHub
2. Import project in Vercel
3. Deploy (zero configuration needed)

## Demo Flow

### Quick Start (2-minute demo)

1. **File a Claim** → Go to `/` and chat with the FNOL assistant
2. **Enter any policy number** (e.g., `POL123`) → system simulates lookup
3. **Select accident type** → pick from collision, theft, hit-and-run, etc.
4. **Answer prompts** → date, location, damage description
5. **Upload photos** (optional) → or click "Skip"
6. **Confirm submission** → type "yes" when shown the summary

### See AI Triage

7. Click **"View Triage Analysis"** after submission
8. Watch the AI analysis animation (scores calculate in real-time)
9. Review the 5 score cards: Complexity, Severity, Fraud Risk, Customer Value, Urgency
10. Note the **dynamic insights** — they change based on your inputs (photos, description length, accident type)
11. Click **"Confirm Assignment & View Status"**

### Watch Real-Time Simulation

12. On the Status page, click **"Start Demo"** (purple banner)
13. Watch the timeline animate through all stages every 2.5 seconds:
    - Claim Submitted → Triage → Assigned → Investigation → Assessment → Settlement → Closed
14. Notifications appear as each stage completes
15. Click **"Reset"** to run the simulation again

### Adjuster Dashboard (Ops View)

16. Click **"Adjuster View"** (top-right of chat screen) or go to `/dashboard`
17. See all submitted claims with scores, risk flags, and routing
18. Filter by: All / Pending Triage / Active / Closed
19. Click any claim row to view its status page

## Key URLs

| Page | URL | Description |
|------|-----|-------------|
| FNOL Chat | `/` | File a new claim via conversational AI |
| Triage Dashboard | `/triage/[claimId]` | View AI scores and routing |
| Status Portal | `/status/[claimId]` | Track claim progress + run simulation |
| Adjuster Dashboard | `/dashboard` | Ops view of all claims |

## Features to Highlight

- **Dynamic AI Insights**: Triage insights change based on actual claim data (photo count, description length, accident type)
- **Two-Sided Product**: Both customer (FNOL, Status) and ops (Dashboard) experiences
- **Real-Time Simulation**: Animated claim lifecycle for demo purposes
- **Persistent State**: Claims survive page refresh (localStorage)

## License

MIT
