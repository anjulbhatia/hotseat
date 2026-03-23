export type Screen =
  | 'landing'
  | 'category'
  | 'intro'
  | 'game'
  | 'gameover'
  | 'victory'
  | 'leaderboard'

export type Category = 'ai' | 'entertainment' | 'sports' | 'world' | 'surprise'

export type Difficulty = 'easy' | 'medium' | 'hard'

export type AnswerState = 'idle' | 'locked' | 'correct' | 'wrong' | 'listening' | 'speaking'

export type Lifeline = '5050' | 'swap' | 'skip' | 'expert'

export interface Question {
  question: string
  options: string[]
  answer: string
  difficulty: Difficulty
}

export interface LeaderboardEntry {
  name: string
  category: Category
  score: number
  questionsCorrect: number
  timestamp: number
}

export interface GameState {
  screen: Screen
  playerName: string
  playerAge?: number
  category: Category | null
  questions: Question[]
  currentQuestionIndex: number
  selectedOption: string | null
  answerState: AnswerState
  score: number
  securedScore: number
  lifelinesUsed: Set<Lifeline>
  eliminatedOptions: string[]
  questionsCorrect: number
}

export const PRIZE_LADDER = [10, 20, 50, 100, 200, 500, 1000, 2500, 5000, 10000]

export const CHECKPOINTS = [2, 6, 9]

export const TIMERS: Record<number, number | null> = {
  0: 30, 1: 30, 2: 30,
  3: 45, 4: 45, 5: 45,
  6: null, 7: null, 8: null, 9: null
}

export const CATEGORY_LABELS: Record<Category, string> = {
  ai: 'AI & Tech',
  entertainment: 'Entertainment',
  sports: 'Sports',
  world: 'World Affairs',
  surprise: 'Surprise Me'
}

export const formatPrize = (amount: number): string => {
  if (amount >= 10000) return `${(amount / 10000).toFixed(0)}0K`
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`
  return `${amount}`
}