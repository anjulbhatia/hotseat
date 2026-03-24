'use client'
import { useState, useEffect, useRef } from 'react'
import { useGame } from '@/hooks/game-context'
import { motion } from 'motion/react'
import { PrizeLadder } from './PrizeLadder'
import { Orb } from './ui/Orb'
import { Drawer } from './ui/Drawer'
import { useAppConversation } from '@/hooks/useAppConversation'
import { PRIZE_LADDER, CHECKPOINTS, TIMERS, formatPrize } from '@/lib/types'
import { SquareUser } from 'lucide-react'

const OPTION_LETTERS = ['A', 'B', 'C', 'D']

export function GameplayScreen() {
  const { state, dispatch, selectOption, resolveAnswer, activateFiftyFifty, activateSkip, goToScreen, nextQuestion } = useGame()
  const { questions, currentQuestionIndex, selectedOption, answerState, lifelinesUsed, score, playerName } = state

  const lastQuestionIndexRef = useRef(-1)
  const lastAnswerStateRef = useRef('')
  const [showAside, setShowAside] = useState(true)
  const [showExplanationDrawer, setShowExplanationDrawer] = useState(false)
  const [explanationText, setExplanationText] = useState('')
  const [explanationSources, setExplanationSources] = useState<{url: string, title: string, description: string}[]>([])
  const [expertLoading, setExpertLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  const handleExpertLifelineRef = useRef<() => Promise<void>>(async () => {})
  const handleSwapLifelineRef = useRef<() => Promise<void>>(async () => {})

  const voice = useAppConversation({
    onChooseOption: (option: string) => {
      console.log('[Voice] Choosing option:', option)
      selectOption(option)
    },
    onChooseLifeline: (lifeline: '5050' | 'swap' | 'skip' | 'expert') => {
      console.log('[Voice] Using lifeline:', lifeline)
      if (lifeline === '5050') activateFiftyFifty()
      else if (lifeline === 'swap') handleSwapLifelineRef.current?.()
      else if (lifeline === 'skip') activateSkip()
      else if (lifeline === 'expert') handleExpertLifelineRef.current?.()
    },
    onRepeatQuestion: () => {},
    onRepeatOptions: () => {},
    onQuit: () => {
      voice.disconnect()
      goToScreen('landing')
    },
    onGetExplanation: () => {},
    onPauseGame: () => {},
    onResumeGame: () => {},
    onReadyForNextQuestion: () => {
      console.log('[Voice] Ready for next question')
      nextQuestion()
    },
  })
  const hasVoice = !!process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID

  // Connect to voice on mount
  useEffect(() => {
    if (hasVoice && !voice.isConnected) {
      voice.connect()
    }
  }, [hasVoice, voice])

  // Send question when question changes
  useEffect(() => {
    if (hasVoice && currentQuestionIndex >= 0 && questions.length > 0 && currentQuestionIndex < questions.length) {
      if (currentQuestionIndex !== lastQuestionIndexRef.current) {
        lastQuestionIndexRef.current = currentQuestionIndex
        const q = questions[currentQuestionIndex]
        console.log('[Gameplay] Sending Q' + (currentQuestionIndex + 1) + ':', q.question)
        voice.sendQuestion(q, currentQuestionIndex, score)
      }
    }
  }, [hasVoice, currentQuestionIndex, questions, score, voice])

  // Send answer result
  useEffect(() => {
    if (hasVoice && answerState !== 'idle' && answerState !== lastAnswerStateRef.current) {
      lastAnswerStateRef.current = answerState
      if (answerState === 'correct' || answerState === 'wrong') {
        voice.sendAnswer(selectedOption || '', answerState === 'correct')
      }
    }
  }, [hasVoice, answerState, questions, currentQuestionIndex, selectedOption, voice])

  // Handle checkpoint
  useEffect(() => {
    if (hasVoice && CHECKPOINTS.includes(currentQuestionIndex) && answerState === 'correct') {
      voice.sendCheckpoint(playerName || 'Contestant', currentQuestionIndex, score)
    }
  }, [hasVoice, currentQuestionIndex, answerState, score, playerName, voice])

  // Handle game over
  useEffect(() => {
    if (hasVoice && answerState === 'wrong') {
      voice.sendGameOver(playerName || 'Contestant', score, currentQuestionIndex)
    }
  }, [hasVoice, answerState, score, currentQuestionIndex, playerName, voice])

  // Handle victory
  useEffect(() => {
    if (hasVoice && currentQuestionIndex === 9 && answerState === 'correct') {
      voice.sendVictory(playerName || 'Contestant')
    }
  }, [hasVoice, currentQuestionIndex, answerState, playerName, voice])

  // Auto move to next question after correct answer
  const nextQuestionRef = useRef(nextQuestion)
  nextQuestionRef.current = nextQuestion

  useEffect(() => {
    if (answerState === 'correct' && currentQuestionIndex < 9) {
      const timer = setTimeout(() => {
        console.log('[Gameplay] Auto-moving to next question')
        nextQuestionRef.current()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [answerState, currentQuestionIndex])

  const currentQuestion = questions[currentQuestionIndex]
  const currentPrize = PRIZE_LADDER[currentQuestionIndex]
  const timerDuration = TIMERS[currentQuestionIndex]
  const hasTimer = false // Timer disabled

  const timeLeftRef = useRef<number | null>(null)

  useEffect(() => {
    if (hasTimer && answerState === 'idle') {
      const newTimeLeft = timerDuration
      timeLeftRef.current = newTimeLeft
      // eslint-disable-next-line react-hooks/set-state-in-effect
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setTimeLeft(newTimeLeft)
    }
  }, [currentQuestionIndex, hasTimer, answerState, timerDuration])

  useEffect(() => {
    if (timeLeft === null || answerState !== 'idle') return
    if (timeLeft === 0) {
      selectOption('')
      return
    }
    const t = setTimeout(() => setTimeLeft(t => t !== null ? t - 1 : null), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, answerState])

  useEffect(() => {
    if (answerState === 'locked') {
      const t = setTimeout(() => {
        const correct = selectedOption === currentQuestion?.answer
        if (correct) {
          setExplanationText(`Correct! ${currentQuestion.answer} is the right answer.`)
        } else {
          setExplanationText(`Wrong! The correct answer was ${currentQuestion.answer}.`)
          setShowExplanationDrawer(true)
        }
        resolveAnswer()
      }, 1500)
      return () => clearTimeout(t)
    }
  }, [answerState, selectedOption, currentQuestion, resolveAnswer])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (answerState !== 'idle') return
      const key = e.key.toUpperCase()
      if (OPTION_LETTERS.includes(key)) {
        const idx = OPTION_LETTERS.indexOf(key)
        const option = currentQuestion?.options[idx]
        if (option) {
          const eliminated = state.eliminatedOptions || []
          if (!eliminated.includes(option)) {
            selectOption(option)
          }
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [answerState, currentQuestion, selectOption, state.eliminatedOptions])

  const handleSelectOption = (option: string) => {
    if (answerState !== 'idle') return
    selectOption(option)
  }

  const handleExpertLifeline = async () => {
    if (answerState !== 'idle') return
    const current = questions[currentQuestionIndex]
    if (!current) return
    
    dispatch({ type: 'USE_LIFELINE', lifeline: 'expert' })
    setExpertLoading(true)
    
    try {
      const res = await fetch('/api/explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: current.question, 
          correctAnswer: current.answer 
        })
      })
      const data = await res.json()
      setExplanationText(data.explanation || `The correct answer is ${current.answer}`)
      setExplanationSources(data.sources || [])
      setShowExplanationDrawer(true)
    } catch (e) {
      setExplanationText(`The correct answer is ${current.answer}`)
      setExplanationSources([])
      setShowExplanationDrawer(true)
    } finally {
      setExpertLoading(false)
    }
  }

  const handleSwapLifeline = async () => {
    if (answerState !== 'idle') return
    const current = questions[currentQuestionIndex]
    if (!current) return
    
    dispatch({ type: 'USE_LIFELINE', lifeline: 'swap' })
    
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: state.category })
      })
      const data = await res.json()
      if (data.questions && data.questions.length > 0) {
        const randomQ = data.questions[Math.floor(Math.random() * data.questions.length)]
        dispatch({ type: 'SWAP_QUESTION', question: randomQ })
      }
    } catch (e) {
      activateSkip()
    }
  }

  handleExpertLifelineRef.current = handleExpertLifeline
  handleSwapLifelineRef.current = handleSwapLifeline

  const handleUseLifeline = (id: string) => {
    if (answerState !== 'idle') return
    if (id === '5050') activateFiftyFifty()
    else if (id === 'swap') handleSwapLifeline()
    else if (id === 'expert') handleExpertLifeline()
  }

  const handleQuit = () => {
    voice.disconnect()
    goToScreen('landing')
  }

  if (!currentQuestion) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: 'hsl(0, 0%, 3.1%)' }}>
        <p className="text-muted-foreground">Loading questions...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'hsl(0, 0%, 3.1%)' }}>
      <div className="flex-1 flex flex-col p-3 lg:p-4 overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="mb-6">
            <Orb 
              state={answerState === 'locked' ? 'listening' : answerState === 'correct' ? 'correct' : answerState === 'wrong' ? 'wrong' : 'idle'} 
              size={64} 
            />
          </div>

          {hasTimer && answerState === 'idle' && timeLeft !== null && (
            <div className="mb-6 w-32">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Time</span>
                <span style={{ color: timeLeft <= 10 ? 'hsl(0, 72%, 45%)' : 'inherit' }}>
                  {timeLeft}s
                </span>
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  className="h-full"
                  style={{ 
                    background: timeLeft <= 10 ? 'hsl(0, 72%, 45%)' : timeLeft <= 20 ? 'hsl(38, 80%, 55%)' : 'hsl(239, 84%, 67%)'
                  }}
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / (timerDuration || 30)) * 100}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          )}

          <div className="w-full max-w-lg mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground uppercase">Q{currentQuestionIndex + 1}</span>
              <span className="text-muted-foreground/30">•</span>
              <img src="/coin.svg" alt="coin" className="w-3 h-3" />
              <span className="text-xs text-muted-foreground">{formatPrize(currentPrize)}</span>
            </div>
            <div 
              className="border p-4"
              style={{ 
                backgroundColor: 'hsl(0, 0%, 4%)', 
                borderColor: 'hsl(0, 0%, 12%)' 
              }}
            >
              <p className="text-white text-base leading-relaxed">{currentQuestion.question}</p>
            </div>
          </div>

          <div className="w-full max-w-lg space-y-2">
            {currentQuestion.options.map((option, i) => {
              const letter = OPTION_LETTERS[i]
              const isSelected = selectedOption === option
              const isEliminated = state.eliminatedOptions?.includes(option)
              const isCorrect = answerState !== 'idle' && option === currentQuestion.answer
              const isWrong = isSelected && answerState === 'wrong'
              const isLocked = answerState !== 'idle'

              return (
                <button
                  key={i}
                  onClick={() => !isEliminated && handleSelectOption(option)}
                  disabled={isEliminated || isLocked}
                  className="w-full flex items-center gap-3 p-3 text-left border transition-all disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: isEliminated ? 'hsl(0, 0%, 2%)' : isCorrect ? 'hsla(160, 84%, 45%, 0.1)' : isWrong ? 'hsla(0, 72%, 45%, 0.1)' : isSelected ? 'hsla(239, 84%, 67%, 0.1)' : 'hsl(0, 0%, 4%)',
                    borderColor: isEliminated ? 'hsl(0, 0%, 8%)' : isCorrect ? 'hsl(160, 84%, 45%)' : isWrong ? 'hsl(0, 72%, 45%)' : isSelected ? 'hsl(239, 84%, 67%)' : 'hsl(0, 0%, 12%)',
                    opacity: isEliminated ? 0.3 : 1,
                  }}
                >
                  <div 
                    className="w-8 h-8 flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ 
                      backgroundColor: isEliminated ? 'hsl(0, 0%, 8%)' : isCorrect ? 'hsla(160, 84%, 45%, 0.2)' : isWrong ? 'hsla(0, 72%, 45%, 0.2)' : isSelected ? 'hsla(239, 84%, 67%, 0.2)' : 'hsl(0, 0%, 10%)',
                      color: isEliminated ? 'hsl(0, 0%, 20%)' : isCorrect ? 'hsl(160, 84%, 45%)' : isWrong ? 'hsl(0, 72%, 45%)' : isSelected ? 'hsl(239, 84%, 67%)' : 'hsl(0, 0%, 60%)'
                    }}
                  >
                    {letter}
                  </div>
                  <span 
                    className="text-sm"
                    style={{ 
                      color: isEliminated ? 'hsl(0, 0%, 20%)' : isCorrect ? 'hsl(160, 84%, 45%)' : isWrong ? 'hsl(0, 72%, 45%)' : 'hsl(0, 0%, 80%)',
                      textDecoration: isEliminated ? 'line-through' : 'none',
                    }}
                  >
                    {option}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div 
        className="hidden lg:flex w-56 flex-col border-l p-3"
        style={{ borderColor: 'hsl(0, 0%, 12%)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/coin.svg" alt="coin" className="w-4 h-4" />
            <span className="text-sm font-mono text-white">{formatPrize(score)}</span>
          </div>
          <button
            onClick={handleQuit}
            className="text-xs font-mono text-muted-foreground border-muted-foreground hover:text-foreground hover:border-foreground transition-colors px-2 py-1 border"
          >
            Quit
          </button>
        </div>

        <div className="flex-1 flex items-center justify-between overflow-y-auto w-full">
          <PrizeLadder currentPrize={currentPrize} currentIndex={currentQuestionIndex} />
        </div>
        
        <div className="pt-2">
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground block mb-2">Lifelines</span>
          <div className="flex gap-2">
            <LifelineButton 
              label="50:50" 
              icon="½" 
              used={lifelinesUsed.has('5050')} 
              onClick={() => handleUseLifeline('5050')} 
              disabled={answerState !== 'idle'} 
            />
            <LifelineButton 
              label="Swap" 
              icon="⟳" 
              used={lifelinesUsed.has('swap')} 
              onClick={() => handleUseLifeline('swap')} 
              disabled={answerState !== 'idle'} 
            />
            <LifelineButton 
              label="Expert" 
              icon={<SquareUser className='font-thin scale-75 text-muted-foreground'/>}  
              used={lifelinesUsed.has('expert')} 
              onClick={() => handleUseLifeline('expert')} 
              disabled={answerState !== 'idle'} 
            />
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowAside(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 lg:hidden w-8 h-20 flex items-center justify-center rounded-l-md z-20 hover:bg-white/10 transition-colors"
        style={{
          backgroundColor: 'hsl(0, 0%, 8%)',
        }}
      >
        <svg className="w-3 h-3 text-muted-foreground rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <Drawer open={showAside && window.innerWidth < 1024} onClose={() => setShowAside(false)} pos="right" size="fit" className="lg:hidden">
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'hsl(0, 0%, 12%)' }}>
            <div className="flex items-center gap-2">
              <img src="/coin.svg" alt="coin" className="w-4 h-4" />
              <span className="text-sm font-mono text-white">{formatPrize(score)}</span>
            </div>
            <button
              onClick={handleQuit}
              className="text-xs font-mono text-muted-foreground hover:text-red-500 transition-colors"
            >
              Quit
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center overflow-y-auto py-3">
            <PrizeLadder currentPrize={currentPrize} currentIndex={currentQuestionIndex} />
          </div>

          <div className="pt-3 border-t" style={{ borderColor: 'hsl(0, 0%, 12%)' }}>
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground block mb-2">Lifelines</span>
            <div className="flex gap-2">
              <LifelineButton 
                label="50:50" 
                icon="½" 
                used={lifelinesUsed.has('5050')} 
                onClick={() => handleUseLifeline('5050')} 
                disabled={answerState !== 'idle'} 
              />
              <LifelineButton 
                label="Swap" 
                icon="⟳" 
                used={lifelinesUsed.has('swap')} 
                onClick={() => handleUseLifeline('swap')} 
                disabled={answerState !== 'idle'} 
              />
              <LifelineButton 
                label="Expert" 
                icon={<img src="/expert.svg" alt="expert" className="w-4 h-4" />} 
                used={lifelinesUsed.has('expert')} 
                onClick={() => handleUseLifeline('expert')} 
                disabled={answerState !== 'idle'} 
              />
            </div>
          </div>
        </div>
      </Drawer>

      <Drawer open={showExplanationDrawer} onClose={() => setShowExplanationDrawer(false)} pos="right" size="full">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Expert Advice</span>
          {expertLoading && <span className="text-xs text-muted-foreground">Loading...</span>}
        </div>
        
        <div className="mb-4">
          <p className="text-white text-base leading-relaxed">
            {explanationText}
          </p>
        </div>

        {explanationSources.length > 0 && (
          <div>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground block mb-3">Sources</span>
            <div className="space-y-3">
              {explanationSources.map((source, i) => (
                <a
                  key={i}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 border transition-colors hover:bg-white/5"
                  style={{
                    backgroundColor: 'hsl(0, 0%, 5%)',
                    borderColor: 'hsl(0, 0%, 12%)'
                  }}
                >
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'hsl(239, 84%, 67%)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{source.title}</p>
                      <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{source.description}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}

function LifelineButton({ label, icon, used, onClick, disabled }: { label: string; icon: React.ReactNode; used: boolean; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={used || disabled}
      className="flex-1 flex flex-col items-center gap-1 py-2 border transition-all disabled:cursor-not-allowed"
      style={{ 
        backgroundColor: used ? 'hsl(0, 0%, 2%)' : 'hsl(0, 0%, 4%)',
        borderColor: used ? 'hsl(0, 0%, 8%)' : 'hsl(0, 0%, 12%)',
        opacity: used ? 0.3 : 1,
      }}
    >
      <span className="text-sm" style={{ color: used ? 'hsl(0, 0%, 20%)' : 'hsl(0, 0%, 60%)' }}>
        {used ? '×' : typeof icon === 'string' ? icon : icon}
      </span>
      <span className="text-[8px] uppercase tracking-widest" style={{ color: used ? 'hsl(0, 0%, 20%)' : 'hsl(0, 0%, 40%)' }}>
        {label}
      </span>
    </button>
  )
}
