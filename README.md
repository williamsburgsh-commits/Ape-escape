# APE ESCAPE - Retro Clicker Game 🦍

A retro clicker game built with Next.js, TypeScript, Tailwind CSS, and Supabase. Players tap to evolve through stages but face slip events that can set them back!

## Features

### Core Game Mechanics
- **Stage Evolution**: Progress through stages using the formula `Math.floor(40 * stage * Math.sqrt(stage))`
- **Tappable Ape**: Large monkey emoji in the center that responds to clicks
- **Progress Bar**: Visual indicator showing progress to the next stage
- **Slip Events**: 2% chance of slipping with fun messages
- **Retro Styling**: Purple gradient background with yellow buttons and Press Start 2P font

### Authentication & User Management
- **Supabase Authentication**: Email/password signup and login
- **Email Verification**: Required for new accounts
- **Username Selection**: One-time username setup after signup
- **Profile Management**: Persistent user profiles with game progress

### Anti-Cheat System
- **Client-side Rate Limiting**: Max 10 taps per second
- **Server-side Validation**: Rejects taps faster than 150ms apart
- **Suspicious Activity Logging**: Tracks users exceeding 15 taps/second
- **Warning Messages**: Shows "Slow down there, speed demon! 🏃‍♂️" for excessive tapping

### Offline Support
- **localStorage Sync**: Saves game state locally on every tap
- **Offline Detection**: Shows "🔄 Reconnecting..." when offline
- **Auto-sync**: Syncs with server when connection is restored
- **Conflict Resolution**: Uses newer timestamp between local and server data

### Error Handling
- **Global Error Boundary**: Catches and displays errors gracefully
- **Connection Failures**: Handles Supabase connection issues
- **Demo Mode**: Continues playing with localStorage when servers are down
- **Auto-retry**: Retries failed operations every 30 seconds

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Styling**: Press Start 2P font, custom CSS animations
- **State Management**: React Context API
- **Offline Storage**: localStorage

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo>
cd ape-escape
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Update `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up Database Schema

Run the SQL commands from `supabase-schema.sql` in your Supabase SQL editor:

```sql
-- Enable RLS (Row Level Security)
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS game_events ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  current_stage INTEGER DEFAULT 1,
  total_taps INTEGER DEFAULT 0,
  rug_meter INTEGER DEFAULT 0,
  high_score INTEGER DEFAULT 0,
  suspicious_activity_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_events table
CREATE TABLE IF NOT EXISTS game_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('tap', 'slip', 'stage_up')),
  stage INTEGER NOT NULL,
  taps INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes, policies, and triggers (see full schema file)
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start playing!

## Game Layout

- **Header**: Logo, APE balance placeholder, username, and exit button
- **Left Sidebar**: Navigation menu (Dashboard, Profile, Gang, Leaderboard, etc.)
- **Center**: Main game area with tappable ape and progress bar
- **Right Sidebar**: Stats boxes (Total Taps, Current Stage, Rug Count, High Score)

## Game Rules

1. **Tap the Ape**: Click the monkey emoji to increase your tap count
2. **Progress Through Stages**: Each stage requires more taps than the last
3. **Avoid Slips**: 2% chance of slipping and losing progress
4. **Stay Within Limits**: Don't tap too fast or you'll get warnings
5. **Play Offline**: Game continues working even without internet

## Development

### Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── globals.css     # Global styles and animations
│   ├── layout.tsx      # Root layout with font setup
│   └── page.tsx        # Main game page
├── components/         # React components
│   ├── ErrorBoundary.tsx
│   ├── GameArea.tsx
│   ├── Header.tsx
│   ├── LeftSidebar.tsx
│   ├── LoginForm.tsx
│   ├── RightSidebar.tsx
│   └── UsernameSelection.tsx
├── contexts/           # React contexts
│   ├── AuthContext.tsx
│   └── GameContext.tsx
├── lib/               # Utilities
│   └── supabase.ts    # Supabase client configuration
└── types/             # TypeScript types
    └── game.ts        # Game-related type definitions
```

### Key Features Implementation

- **Anti-cheat**: Rate limiting in `GameContext.tsx`
- **Offline Support**: localStorage sync in `GameContext.tsx`
- **Error Handling**: Global error boundary in `ErrorBoundary.tsx`
- **Authentication**: Supabase auth in `AuthContext.tsx`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for learning or commercial purposes!

---

**Happy Tapping! 🦍👆**