# HotSeat

> Ten questions. One shot. Are you wise enough — or are you out?

A cinematic quiz game powered by **ElevenLabs** voice + **Firecrawl** live question fetching.

Built for the ElevenLabs x Firecrawl Hackathon.

---

## Stack

- Next.js
- Tailwind CSS
- ElevenLabs Voice Design (Amitabh-style host voice)
- Firecrawl (live web question fetching)
- Convex (leaderboard — swap in for the in-memory API route)

---

## Setup

```bash
git clone https://github.com/anjulbhatia/wise_or_out.git
cd wiseorout
bun install
```

Copy all component files into `src/`. Then:

```bash
cp .env.local.example .env.local
# Fill in your API keys
npm run dev
```

---

## Pre-generate ElevenLabs Audio

Before deploying, generate these 6 clips in ElevenLabs Voice Design and save to `/public/audio/`:

| File | Script |
|------|--------|
| `intro.mp3` | "Welcome. You have come far to sit in this chair. Ten questions stand between you and everything. The question is — are you wise enough... or are you out?" |
| `correct-low.mp3` | "Correct! You're on your way." |
| `correct-high.mp3` | "Extraordinary. Very few make it this far." |
| `wrong.mp3` | "And that... is where your journey ends. So close, yet so far." |
| `checkpoint.mp3` | "You have secured this amount. It is yours, no matter what happens next." |
| `victory.mp3` | "Unbelievable. You have done what almost no one does. You are wise. You are not out." |

Voice settings: Deep baritone, slow cadence, dramatic pauses, high stability.

---

## Architecture

All screens are managed via `GameContext` state — no page routing. 
The `GameRouter` in `page.tsx` switches components based on `state.screen`.

```
landing → category → intro → game → gameover / victory → leaderboard
```

### Files

```
src/
  lib/
    types.ts          — All types, constants, prize ladder
    game-context.tsx  — Global state + all game actions
    questions.ts      — Firecrawl question fetcher
    audio.ts          — ElevenLabs audio manager
  components/
    LandingScreen.tsx
    CategoryScreen.tsx
    IntroScreen.tsx
    GameScreen.tsx    — Core loop (most important)
    EndScreens.tsx    — GameOver + Victory
    LeaderboardScreen.tsx
  app/
    page.tsx          — GameProvider + GameRouter
    api/
      questions/route.ts   — Firecrawl + Claude question API
      leaderboard/route.ts — Score storage + percentile
```

---

Built by @aunn · Powered by ElevenLabs + Firecrawl
