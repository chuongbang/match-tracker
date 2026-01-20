# Match Tracker (Next.js + Supabase + Tailwind)

Web app to track badminton players in a session: wins/losses, fees, and net payable amounts.
Supports daily tracking + historical reports (daily/range views).

## Quick Start (Local)

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Features

- ✅ Add players, track wins/losses per session
- ✅ Calculate total payable: `fee + (wins - losses) × per_match_reward`
- ✅ Session management (service fee per session)
- ✅ Reports: view all historical data by date range
- ✅ LocalStorage fallback (works without Supabase)
- ✅ Supabase integration for persistence & multi-device sync

## Setup Supabase (Optional but recommended for reports)

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the SQL schema from `supabase_schema.sql` into Supabase SQL Editor
4. Copy your credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

If no Supabase env vars, app uses `localStorage` only (data persists locally).

## Deploy to Vercel

1. Push repo to GitHub
2. Go to [vercel.com](https://vercel.com), import project
3. Vercel auto-detects Next.js
4. Add Supabase env vars in Project Settings → Environment Variables
5. Deploy!

### Environment on Vercel

```
NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...xxx
```

## File Structure

```
MatchTracker/
├── pages/
│   ├── index.js                    # Main session page
│   ├── _app.js                      # App wrapper + globals.css
│   └── api/
│       ├── sessions.js              # GET/POST sessions
│       ├── players.js               # GET/POST players
│       ├── sessions/[sessionId]/
│       │   ├── players.js           # Session players stats
│       │   └── matches.js           # Record match results
│       └── reports/[type].js        # Daily/range reports
├── components/
│   ├── Header.js                    # Date, service fee, buttons
│   ├── PlayerCard.js                # Player row + win/loss buttons
│   ├── AddPlayerModal.js            # Modal to add new player
│   └── ReportView.js                # Reports page (daily/range)
├── lib/
│   └── supabase.js                  # Supabase client
├── styles/
│   └── globals.css                  # Tailwind + custom styles
├── supabase_schema.sql              # SQL schema (copy to Supabase)
└── package.json
```

## Data Model

**Sessions**: Track each day's event (date, service fee)

**Players**: Global player list

**Session Players**: Links player to session (fee, per-match-reward, win/loss stats)

**Matches**: Individual match records (player A vs B, winner, amount)

## Calculations

For each player per session:
- **Net Match**: (wins - losses) × per_match_reward
- **Total Payable**: fee + net_match
  - If positive: player pays this amount
  - If negative: player receives this amount

## Customization

### Modify per-match reward
Edit in `AddPlayerModal.js` default:
```js
const [perMatch, setPerMatch] = useState(10) // change default here
```

### Change colors
Edit `globals.css` or `tailwind.config.js`

### Add more stats
Edit `components/ReportView.js` to add charts (e.g., Recharts)

## Notes

- Data syncs to Supabase automatically when adding players
- Reports require Supabase setup for historical data
- LocalStorage is a backup; clear browser cache to reset local data
- For production, configure Supabase RLS policies for security
