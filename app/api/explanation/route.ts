import { NextRequest, NextResponse } from 'next/server'

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY
const isConfigured = (key: string | undefined) => !!key && key !== 'your-api-key-here'

interface Source {
  url: string
  title: string
  description: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const question = body.question || ''
    const correctAnswer = body.correctAnswer || ''
    
    let explanation = ''
    let sources: Source[] = []
    let context = ''
    
    if (isConfigured(FIRECRAWL_API_KEY)) {
      try {
        const searchQuery = `${correctAnswer} ${question}`.slice(0, 200)
        
        const searchRes = await fetch('https://api.firecrawl.dev/v1/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
          },
          body: JSON.stringify({ 
            query: searchQuery, 
            limit: 5 
          }),
        })
        
        if (searchRes.ok) {
        const searchData = await searchRes.json()
        
        interface SearchResult {
          url?: string
          title?: string
          description?: string
        }
        
        sources = (searchData.data || []).map((r: SearchResult) => ({
            url: r.url || '',
            title: r.title || r.url || 'Source',
            description: r.description || ''
          })).slice(0, 3)
          
          if (sources.length > 0 && sources[0].url) {
            const scrapeUrl = sources[0].url
            const scrapeRes = await fetch('https://api.firecrawl.dev/v1/scrape', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
              },
              body: JSON.stringify({
                url: scrapeUrl,
                formats: ['markdown'],
              }),
            })
            
            if (scrapeRes.ok) {
              const scrapeData = await scrapeRes.json()
              context = scrapeData.data?.markdown?.slice(0, 1500) || ''
              
              if (context) {
                explanation = `The correct answer is ${correctAnswer}. ${context.slice(0, 300)}`
              }
            }
          }
        }
      } catch (e) {
        console.warn('Firecrawl search failed:', e)
      }
    }

    if (!explanation) {
      explanation = generateFallbackExplanation(question, correctAnswer)
    }

    return NextResponse.json({ 
      correctAnswer,
      explanation, 
      sources,
      context 
    })
  } catch (error) {
    console.error('Explanation API error:', error)
    return NextResponse.json({ 
      correctAnswer: '',
      explanation: 'Unable to fetch explanation.', 
      sources: [],
      context: '' 
    }, { status: 200 })
  }
}

function generateFallbackExplanation(question: string, correctAnswer: string): string {
  const lowerQuestion = question.toLowerCase()
  
  if (lowerQuestion.includes('capital') || lowerQuestion.includes('country')) {
    return `${correctAnswer} is the correct answer - a well-established geographical fact.`
  }
  if (lowerQuestion.includes('who') || lowerQuestion.includes('person')) {
    return `${correctAnswer} is the right choice - a historical or cultural fact.`
  }
  if (lowerQuestion.includes('what') || lowerQuestion.includes('what is')) {
    return `The answer is ${correctAnswer}. This is based on established knowledge.`
  }
  if (lowerQuestion.includes('how many') || lowerQuestion.includes('number')) {
    return `${correctAnswer} is the correct number - a factual piece of information.`
  }
  if (lowerQuestion.includes('which')) {
    return `${correctAnswer} is the correct answer based on established facts.`
  }
  
  return `The correct answer is ${correctAnswer}.`
}
