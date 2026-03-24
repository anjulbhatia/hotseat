import type { Category, Question } from '@/lib/types'

export async function fetchQuestions(category: Category): Promise<Question[]> {
  console.log('[fetchQuestions] Fetching from API for category:', category)
  
  const response = await fetch('/api/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category })
  })
  
  const data = await response.json()
  console.log('[fetchQuestions] API response:', data)
  
  if (data.questions && data.questions.length > 0) {
    return data.questions
  }
  
  throw new Error('No questions from Firecrawl')
}
