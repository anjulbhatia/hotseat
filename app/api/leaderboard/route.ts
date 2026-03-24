import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory store for hackathon
// Replace with Convex mutations in production
const leaderboard: Array<{
  name: string
  category: string
  score: number
  questionsCorrect: number
  timestamp: number
}> = []

export async function GET() {
  const sorted = [...leaderboard]
    .sort((a, b) => b.score - a.score)
    .slice(0, 50)

  return NextResponse.json({ entries: sorted })
}

export async function POST(req: NextRequest) {
  const entry = await req.json()

  leaderboard.push({
    name: entry.name || 'Anonymous',
    category: entry.category,
    score: entry.score,
    questionsCorrect: entry.questionsCorrect,
    timestamp: entry.timestamp || Date.now(),
  })

  // Calculate percentile
  const total = leaderboard.length
  const higher = leaderboard.filter(e => e.score > entry.score).length
  const percentile = Math.round((higher / total) * 100)

  return NextResponse.json({ success: true, percentile })
}