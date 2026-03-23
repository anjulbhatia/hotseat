const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY

interface SearchResult {
  title: string
  url: string
  content: string
}

export async function searchWeb(query: string): Promise<SearchResult[]> {
  if (!FIRECRAWL_API_KEY || FIRECRAWL_API_KEY === 'your-firecrawl-key-here') {
    console.warn('Firecrawl API key not configured, skipping search')
    return []
  }

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        limit: 5,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Firecrawl API error: ${error}`)
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Search error:', error)
    return []
  }
}

export async function scrapeContent(url: string): Promise<string> {
  if (!FIRECRAWL_API_KEY || FIRECRAWL_API_KEY === 'your-firecrawl-key-here') {
    return ''
  }

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
      }),
    })

    if (!response.ok) {
      return ''
    }

    const data = await response.json()
    return data.markdown || ''
  } catch (error) {
    console.error('Scrape error:', error)
    return ''
  }
}
