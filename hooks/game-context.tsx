'use client'
import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react'
import { GameState, Screen, Category, Question, Lifeline, PRIZE_LADDER, CHECKPOINTS } from '@/lib/types'
import { fetchQuestions } from './questions'

const initialState: GameState = {
  screen: 'landing',
  playerName: '',
  playerAge: undefined,
  category: null,
  questions: [],
  currentQuestionIndex: 0,
  selectedOption: null,
  answerState: 'idle',
  score: 0,
  securedScore: 0,
  lifelinesUsed: new Set(),
  eliminatedOptions: [],
  questionsCorrect: 0,
}

type Action =
  | { type: 'SET_SCREEN'; screen: Screen }
  | { type: 'SET_PLAYER'; name: string; age?: number }
  | { type: 'SET_CATEGORY'; category: Category }
  | { type: 'SET_QUESTIONS'; questions: Question[] }
  | { type: 'SELECT_OPTION'; option: string }
  | { type: 'LOCK_ANSWER' }
  | { type: 'RESOLVE_ANSWER'; correct: boolean }
  | { type: 'NEXT_QUESTION' }
  | { type: 'USE_LIFELINE'; lifeline: Lifeline }
  | { type: 'ELIMINATE_OPTIONS'; options: string[] }
  | { type: 'SWAP_QUESTION'; question: Question }
  | { type: 'RESET' }

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen }

    case 'SET_PLAYER':
      return { ...state, playerName: action.name, playerAge: action.age }

    case 'SET_CATEGORY':
      return { ...state, category: action.category }

    case 'SET_QUESTIONS':
      return { ...state, questions: action.questions }

    case 'SELECT_OPTION':
      if (state.answerState !== 'idle') return state
      return { ...state, selectedOption: action.option, answerState: 'locked' }

    case 'RESOLVE_ANSWER': {
      const newIndex = state.currentQuestionIndex
      const isCorrect = action.correct
      const newScore = isCorrect ? PRIZE_LADDER[newIndex] : state.score
      const isCheckpoint = CHECKPOINTS.includes(newIndex)
      const newSecured = isCorrect && isCheckpoint ? PRIZE_LADDER[newIndex] : state.securedScore
      return {
        ...state,
        answerState: isCorrect ? 'correct' : 'wrong',
        score: newScore,
        securedScore: newSecured,
        questionsCorrect: isCorrect ? state.questionsCorrect + 1 : state.questionsCorrect,
      }
    }

    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
        selectedOption: null,
        answerState: 'idle',
        eliminatedOptions: [],
      }

    case 'USE_LIFELINE':
      return { ...state, lifelinesUsed: new Set([...state.lifelinesUsed, action.lifeline]) }

    case 'ELIMINATE_OPTIONS':
      return { ...state, eliminatedOptions: action.options }

    case 'SWAP_QUESTION': {
      const newQuestions = [...state.questions]
      newQuestions[state.currentQuestionIndex] = action.question
      return { ...state, questions: newQuestions }
    }

    case 'RESET':
      return { ...initialState }

    default:
      return state
  }
}

interface GameContextType {
  state: GameState
  dispatch: React.Dispatch<Action>
  goToScreen: (screen: Screen) => void
  startGame: (name: string, age?: number, category?: Category) => void
  selectCategory: (category: Category) => void
  selectOption: (option: string) => void
  resolveAnswer: () => void
  nextQuestion: () => void
  activateFiftyFifty: () => void
  activateSwap: (newQuestion: Question) => void
  activateSkip: () => void
  resetGame: () => void
}

const GameContext = createContext<GameContextType | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const goToScreen = useCallback((screen: Screen) => {
    dispatch({ type: 'SET_SCREEN', screen })
  }, [])

  const startGame = useCallback(async (name: string, age?: number, category?: Category) => {
    dispatch({ type: 'SET_PLAYER', name, age })
    if (category) {
      dispatch({ type: 'SET_CATEGORY', category })
      try {
        console.log('[GameContext] Fetching questions for:', category)
        const questions = await fetchQuestions(category)
        console.log('[GameContext] Got questions:', questions.length)
        dispatch({ type: 'SET_QUESTIONS', questions })
      } catch (e) {
        console.error('[GameContext] Failed to fetch questions:', e)
        alert('Failed to load questions. Please check API configuration.')
        return
      }
    }
    goToScreen('game')
  }, [goToScreen])

  const selectCategory = useCallback((category: Category) => {
    dispatch({ type: 'SET_CATEGORY', category })
    goToScreen('game')
  }, [goToScreen])

  const selectOption = useCallback((option: string) => {
    dispatch({ type: 'SELECT_OPTION', option })
  }, [])

  const resolveAnswer = useCallback(() => {
    const { questions, currentQuestionIndex, selectedOption } = state
    const current = questions[currentQuestionIndex]
    const correct = selectedOption === current.answer
    dispatch({ type: 'RESOLVE_ANSWER', correct })
    setTimeout(() => {
      if (correct) {
        if (currentQuestionIndex === 9) {
          goToScreen('victory')
        } else {
          dispatch({ type: 'NEXT_QUESTION' })
        }
      } else {
        goToScreen('gameover')
      }
    }, 2500)
  }, [state, goToScreen])

  const nextQuestion = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION' })
  }, [])

  const activateFiftyFifty = useCallback(() => {
    const { questions, currentQuestionIndex, lifelinesUsed } = state
    if (lifelinesUsed.has('5050')) return
    const current = questions[currentQuestionIndex]
    const wrong = current.options.filter(o => o !== current.answer)
    const toEliminate = wrong.sort(() => Math.random() - 0.5).slice(0, 2)
    dispatch({ type: 'USE_LIFELINE', lifeline: '5050' })
    dispatch({ type: 'ELIMINATE_OPTIONS', options: toEliminate })
  }, [state])

  const activateSwap = useCallback((newQuestion: Question) => {
    dispatch({ type: 'USE_LIFELINE', lifeline: 'swap' })
    dispatch({ type: 'SWAP_QUESTION', question: newQuestion })
  }, [])

  const activateSkip = useCallback(() => {
    const { lifelinesUsed, currentQuestionIndex } = state
    if (lifelinesUsed.has('skip')) return
    dispatch({ type: 'USE_LIFELINE', lifeline: 'skip' })
    dispatch({ type: 'NEXT_QUESTION' })
  }, [state])

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])

  return (
    <GameContext.Provider value={{
      state, dispatch, goToScreen, startGame, selectCategory,
      selectOption, resolveAnswer, nextQuestion,
      activateFiftyFifty, activateSwap, activateSkip, resetGame
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside GameProvider')
  return ctx
}
