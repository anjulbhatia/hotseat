'use client'
import { useEffect, useState } from 'react'
import { useGame } from '@/hooks/game-context'
import { LeaderboardEntry, Category, CATEGORY_LABELS, formatPrize } from '@/lib/types'
import { X } from 'lucide-react'

const RANK_COLORS = ['#D4AF37', '#C0C0C0', '#CD7F32']
const RANK_LABELS = ['1st', '2nd', '3rd']

interface LeaderboardModalProps {
  open: boolean
  onClose: () => void
}

export function LeaderboardModal({ open, onClose }: LeaderboardModalProps) {
  const { state, resetGame } = useGame()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [filter, setFilter] = useState<Category | 'all'>('all')
  const [loading, setLoading] = useState(true)

  const categories: (Category | 'all')[] = ['all', 'ai', 'entertainment', 'sports', 'world', 'surprise']

  useEffect(() => {
    if (open) {
      fetch('/api/leaderboard')
        .then(r => r.json())
        .then(data => { setEntries(data.entries || []); setLoading(false) })
        .catch(() => setLoading(false))
    }
  }, [open])

  const filtered = filter === 'all'
    ? entries
    : entries.filter(e => e.category === filter)

  const sorted = [...filtered].sort((a, b) => b.score - a.score).slice(0, 50)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div 
        className="relative w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col"
        style={{ 
          backgroundColor: '#050508',
          border: '1px solid #1A1A1A',
          borderRadius: '8px'
        }}
      >
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.08)_0%,transparent_70%)] pointer-events-none" 
        />

        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: '#1A1A1A' }}>
          <div className="text-center flex-1">
            <h2 
              className="text-white text-xl font-semibold" 
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Hall of the Wise
            </h2>
            <p className="text-[#444] text-xs mt-0.5">Top 50 players</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#333] hover:text-[#666] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 flex-wrap p-4 border-b" style={{ borderColor: '#1A1A1A' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="px-3 py-1.5 text-xs uppercase tracking-widest transition-all rounded-sm"
              style={{
                background: filter === cat ? 'rgba(212,175,55,0.15)' : '#0A0A0F',
                border: `1px solid ${filter === cat ? '#D4AF37' : '#1A1A1A'}`,
                color: filter === cat ? '#D4AF37' : '#444',
              }}
            >
              {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-[#333] text-sm">Loading scores...</div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#333] text-sm mb-4">No scores yet. Be the first.</p>
              <button
                onClick={() => { onClose(); resetGame(); }}
                className="px-8 py-3 text-sm font-semibold tracking-widest uppercase"
                style={{ 
                  background: 'linear-gradient(135deg, #D4AF37, #8B6914)', 
                  color: '#050508',
                  borderRadius: '2px'
                }}
              >
                Play Now
              </button>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: '#111' }}>
              {sorted.map((entry, i) => (
                <LeaderboardRow
                  key={i}
                  rank={i + 1}
                  entry={entry}
                  isYou={entry.name === state.playerName}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LeaderboardRow({
  rank, entry, isYou
}: {
  rank: number
  entry: LeaderboardEntry
  isYou: boolean
}) {
  const isTop3 = rank <= 3
  const rankColor = isTop3 ? RANK_COLORS[rank - 1] : '#333'

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 transition-colors"
      style={{
        background: isYou ? 'rgba(212,175,55,0.07)' : rank <= 3 ? `${rankColor}08` : 'transparent',
        border: `1px solid ${isYou ? '#D4AF37' : rank <= 3 ? `${rankColor}30` : 'transparent'}`,
        borderRadius: '3px',
        margin: '0 4px',
      }}
    >
      <div
        className="w-8 text-xs font-bold text-center flex-shrink-0"
        style={{ color: rankColor, fontFamily: 'Georgia, serif' }}
      >
        {isTop3 ? RANK_LABELS[rank - 1] : rank}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-medium truncate"
            style={{ color: isYou ? '#D4AF37' : '#CCC' }}
          >
            {entry.name}
          </span>
          {isYou && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-sm"
              style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37' }}
            >
              you
            </span>
          )}
        </div>
        <div className="text-[#333] text-xs capitalize mt-0.5">
          {CATEGORY_LABELS[entry.category]} · {entry.questionsCorrect}/10
        </div>
      </div>

      <div
        className="text-sm font-semibold flex-shrink-0"
        style={{ color: isTop3 ? rankColor : '#666', fontFamily: 'Georgia, serif' }}
      >
        {formatPrize(entry.score)}
      </div>
    </div>
  )
}
