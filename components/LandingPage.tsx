'use client'
import { useState, useEffect } from 'react'
import { useGame } from '@/hooks/game-context'
import { Category } from '@/lib/types'
import { motion, AnimatePresence } from 'motion/react'
import { Header } from './ui/Header'
import { Footer } from './ui/Footer'
import { Orb } from './ui/Orb'

const CATEGORIES: Category[] = ['surprise', 'ai', 'entertainment', 'sports', 'world']

const CATEGORY_META: Record<Category, { icon: string; color: string; label: string }> = {
  surprise: { icon: '✦', color: '#7C86FF', label: 'Surprise' },
  ai: { icon: '◈', color: '#4A9EFF', label: 'AI' },
  entertainment: { icon: '◉', color: '#FF6B9D', label: 'Movies' },
  sports: { icon: '◎', color: '#4CAF50', label: 'Sports' },
  world: { icon: '◇', color: '#FF9800', label: 'World' },
}

const TEXT_LINES = [
  "Welcome to HotSeat",
  "An interactive quiz to find out if you're wise",
  "The game is simple",
  "10 questions",
  "Each with 4 options",
  "Only one is correct",
  "Correct answers take you up",
  "Wrong answers bring you down",
  "Three checkpoints",
  "Three lifelines"
]

interface LandingPageProps {
  onLeaderboardClick: () => void
  onLanguageToggle: () => void
  language: 'en' | 'hi'
}

export function LandingPage({ onLeaderboardClick, onLanguageToggle, language }: LandingPageProps) {
  const { startGame } = useGame()
  const [selectedCategory, setSelectedCategory] = useState<Category>('surprise')
  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null)
  const [textIndex, setTextIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex(prev => (prev + 1) % TEXT_LINES.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  const handleStart = () => {
    startGame('Contestant', undefined, selectedCategory)
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'hsl(0, 0%, 3.1%)' }}>
      <Header 
        onLeaderboardClick={onLeaderboardClick}
        onLanguageToggle={onLanguageToggle}
        language={language}
      />

      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
        <motion.div
          className="relative mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Orb state="idle" size={80} />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.p
            key={textIndex}
            className="text-center text-sm text-muted-foreground px-4 mb-6 h-6"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            {TEXT_LINES[textIndex]}
          </motion.p>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <motion.button
            onClick={handleStart}
            className="mt-4 action-button text-xs py-3 px-8 cursor-pointer"
            whileTap={{ scale: 0.95 }}
          >
            Take the Seat
          </motion.button>
        </motion.div>

        <motion.div
          className="grid grid-cols-5 gap-1.5 w-full max-w-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              onMouseEnter={() => setHoveredCategory(cat)}
              onMouseLeave={() => setHoveredCategory(null)}
              className="p-2 text-center border transition-all cursor-pointer"
              style={{ 
                backgroundColor: selectedCategory === cat ? 'hsla(239, 84%, 67%, 0.1)' : hoveredCategory === cat ? 'hsla(239, 84%, 67%, 0.05)' : 'hsl(0, 0%, 4%)',
                borderColor: selectedCategory === cat ? 'hsl(239, 84%, 67%)' : hoveredCategory === cat ? 'hsl(239, 84%, 67%)' : 'hsl(0, 0%, 12%)' 
              }}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-lg block" style={{ color: CATEGORY_META[cat].color }}>
                {CATEGORY_META[cat].icon}
              </span>
              <span className="text-[9px] text-white block mt-1">
                {CATEGORY_META[cat].label}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
