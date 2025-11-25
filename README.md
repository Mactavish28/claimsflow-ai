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

1. **Start at Home** - Interactive FNOL chat interface
2. **Complete FNOL** - Submit claim details with photos
3. **View Triage** - See AI-calculated scores and routing
4. **Track Status** - Monitor claim progress in real-time

## Using the Platform

1. Launch the app and follow the FNOL assistant prompts. It will collect policy, incident, location, damage, and optional context in sequence.
2. When prompted, upload clear photos of the vehicle; AI damage detection runs automatically and feeds into triage scores.
3. After the assistant shows the claim summary, confirm to submit and note the generated claim ID.
4. Use the `View Triage Analysis` CTA to inspect complexity, severity, fraud risk, and routing recommendations.
5. Use the `Track Claim Status` CTA to view the live progress timeline, adjuster assignment, and notification feed.

## License

MIT
