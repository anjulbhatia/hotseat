import { NextRequest, NextResponse } from 'next/server'

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY

const STORED_QUESTIONS: Record<string, any[]> = {
  ai: [
    // EASY (1-3)
    { q: "Which AI lab released the o3 model in early 2025?", a: "OpenAI", o: ["OpenAI", "Google DeepMind", "Anthropic", "Meta AI"], d: "easy" },
    { q: "What does 'RAG' stand for in AI systems?", a: "Retrieval-Augmented Generation", o: ["Retrieval-Augmented Generation", "Rapid AI Generation", "Recursive Algorithm Graph", "Real-time Agent Gateway"], d: "easy" },
    { q: "Which company made Claude?", a: "Anthropic", o: ["Anthropic", "OpenAI", "Google", "Amazon"], d: "easy" },
 
    // MEDIUM (4-6)
    { q: "What is 'hallucination' in the context of LLMs?", a: "When a model generates false but confident information", o: ["When a model generates false but confident information", "When a model crashes mid-response", "When a model repeats itself", "When a model refuses to answer"], d: "medium" },
    { q: "Which AI model beat the best human players at the Olympiad-level math competition IMO in 2025?", a: "Google DeepMind's AlphaProof", o: ["Google DeepMind's AlphaProof", "OpenAI o3", "Claude 3.5", "Grok 2"], d: "medium" },
    { q: "What is 'context window' in an LLM?", a: "The maximum text the model can read at once", o: ["The maximum text the model can read at once", "The speed of the model's response", "The number of parameters in a model", "The model's memory across sessions"], d: "medium" },
 
    // HARD (7-10)
    { q: "Which technique allows a smaller model to learn from a larger one by mimicking its output distribution?", a: "Knowledge distillation", o: ["Knowledge distillation", "Fine-tuning", "Prompt engineering", "Quantisation"], d: "hard" },
    { q: "What architecture does the Transformer model replace for most NLP tasks?", a: "Recurrent Neural Networks (RNNs)", o: ["Recurrent Neural Networks (RNNs)", "Convolutional Neural Networks (CNNs)", "Bayesian Networks", "Decision Trees"], d: "hard" },
    { q: "In 2024, Geoffrey Hinton won the Nobel Prize in Physics. What was his foundational contribution?", a: "Backpropagation and Boltzmann machines enabling deep learning", o: ["Backpropagation and Boltzmann machines enabling deep learning", "Inventing the Transformer architecture", "Creating the first neural network chip", "Developing reinforcement learning from human feedback"], d: "hard" },
    { q: "What does 'MCP' stand for in the context of AI agent tooling, popularised in 2024-25?", a: "Model Context Protocol", o: ["Model Context Protocol", "Multi-Chain Processing", "Machine Control Pipeline", "Memory Computation Protocol"], d: "hard" },
  ],
 
  entertainment: [
    // Q1 — kept intact as instructed
    { q: "Who is known as King of Bollywood?", a: "Shah Rukh Khan", o: ["Shah Rukh Khan", "Salman Khan", "Aamir Khan", "Akshay Kumar"], d: "easy" },
 
    // EASY (2-3)
    { q: "Which film starring Shah Rukh Khan crossed ₹1000 crore globally in 2023 to become one of Bollywood's biggest ever?", a: "Pathaan", o: ["Pathaan", "Jawan", "Dunki", "Tiger 3"], d: "easy" },
    { q: "Which Indian film won the Oscar for Best Original Song at the 2023 Academy Awards?", a: "Naatu Naatu from RRR", o: ["Naatu Naatu from RRR", "Kesariya from Brahmastra", "Srivalli from Pushpa", "Chaleya from Jawan"], d: "easy" },
 
    // MEDIUM (4-6)
    { q: "Which OTT platform released the Sanjay Leela Bhansali series Heeramandi in 2024?", a: "Netflix", o: ["Netflix", "Amazon Prime Video", "Disney+ Hotstar", "JioCinema"], d: "medium" },
    { q: "Which actress made history as the first Indian woman to present at the Oscars in 2024?", a: "Deepika Padukone", o: ["Deepika Padukone", "Priyanka Chopra", "Alia Bhatt", "Aishwarya Rai"], d: "medium" },
    { q: "What is the name of Imtiaz Ali's 2024 film that reunited him with Arijit Singh for a spiritual road journey story?", a: "Amar Singh Chamkila", o: ["Amar Singh Chamkila", "Chamkila", "Rockstar 2", "Highway 2"], d: "medium" },
 
    // HARD (7-10)
    { q: "Which Bollywood film holds the record for the highest single-day box office collection in India as of 2025?", a: "Jawan", o: ["Jawan", "Pathaan", "Animal", "KGF Chapter 2"], d: "hard" },
    { q: "Konkona Sen Sharma directed which critically acclaimed 2024 short film that won at international festivals?", a: "The Mirror", o: ["The Mirror", "Mumbaikar", "The Last Frame", "Still Water"], d: "hard" },
    { q: "Which director became the first Indian to be on the jury of the Berlin International Film Festival in 2025?", a: "Payal Kapadia", o: ["Payal Kapadia", "Anurag Kashyap", "Zoya Akhtar", "Shonali Bose"], d: "hard" },
    { q: "Payal Kapadia's 'All We Imagine as Light' won the Grand Prix at which 2024 film festival?", a: "Cannes", o: ["Cannes", "Venice", "Berlin", "Sundance"], d: "hard" },
  ],
 
  sports: [
    // EASY (1-3)
    { q: "Who is known as the God of Cricket?", a: "Sachin Tendulkar", o: ["Sachin Tendulkar", "Virat Kohli", "Rohit Sharma", "Rahul Dravid"], d: "easy" },
    { q: "Which team won IPL 2024?", a: "Kolkata Knight Riders", o: ["Kolkata Knight Riders", "Mumbai Indians", "Chennai Super Kings", "Sunrisers Hyderabad"], d: "easy" },
    { q: "Which country hosted the 2024 T20 Cricket World Cup?", a: "USA and West Indies", o: ["USA and West Indies", "India and Sri Lanka", "Australia and New Zealand", "England and Ireland"], d: "easy" },
 
    // MEDIUM (4-6)
    { q: "Who won the Men's Singles title at Wimbledon 2024?", a: "Carlos Alcaraz", o: ["Carlos Alcaraz", "Novak Djokovic", "Jannik Sinner", "Daniil Medvedev"], d: "medium" },
    { q: "India finished Paris 2024 Olympics with how many medals in total?", a: "6", o: ["6", "7", "5", "8"], d: "medium" },
    { q: "Which Indian shuttler won a silver medal at Paris Olympics 2024?", a: "Lakshya Sen", o: ["Lakshya Sen", "PV Sindhu", "Kidambi Srikanth", "Saina Nehwal"], d: "medium" },
 
    // HARD (7-10)
    { q: "Neeraj Chopra won silver at Paris Olympics 2024 with a throw of approximately how many metres?", a: "89.45m", o: ["89.45m", "87.58m", "91.22m", "88.10m"], d: "hard" },
    { q: "Which team ended England's 58-year wait and won Euro 2024?", a: "Spain", o: ["Spain", "Germany", "England", "France"], d: "hard" },
    { q: "Rohit Sharma announced retirement from Test cricket in early 2025 after how many Test matches?", a: "67", o: ["67", "72", "58", "80"], d: "hard" },
    { q: "Who became the youngest player to score a century in the ICC Men's T20 World Cup 2024?", a: "Angkrish Raghuvanshi", o: ["Angkrish Raghuvanshi", "Abhishek Sharma", "Yashasvi Jaiswal", "Tilak Varma"], d: "hard" },
  ],
 
  world: [
    // EASY (1-3)
    { q: "Who won the US Presidential election in November 2024?", a: "Donald Trump", o: ["Donald Trump", "Joe Biden", "Kamala Harris", "Ron DeSantis"], d: "easy" },
    { q: "Which country became the first to successfully land on the Moon's south pole in 2023?", a: "India", o: ["India", "China", "USA", "Russia"], d: "easy" },
    { q: "What is the name of India's lunar mission that achieved this historic landing?", a: "Chandrayaan-3", o: ["Chandrayaan-3", "Chandrayaan-2", "Gaganyaan", "Mangalyaan-2"], d: "easy" },
 
    // MEDIUM (4-6)
    { q: "Which country's Prime Minister was ousted in a student-led revolution in August 2024?", a: "Bangladesh", o: ["Bangladesh", "Pakistan", "Sri Lanka", "Nepal"], d: "medium" },
    { q: "What major global agreement was reached at COP29 in Baku in 2024 regarding climate finance?", a: "Developed nations pledged $300 billion annually to developing countries", o: ["Developed nations pledged $300 billion annually to developing countries", "Carbon trading was banned globally", "Coal phaseout was made legally binding", "Nuclear energy was endorsed as green"], d: "medium" },
    { q: "Which European leader called and lost a snap election in 2024, triggering a major political crisis in his country?", a: "Emmanuel Macron", o: ["Emmanuel Macron", "Olaf Scholz", "Rishi Sunak", "Pedro Sanchez"], d: "medium" },
 
    // HARD (7-10)
    { q: "The BRICS bloc added new member countries in 2024. Which of these is NOT one of the new members?", a: "Turkey", o: ["Turkey", "Egypt", "Ethiopia", "UAE"], d: "hard" },
    { q: "What is the name of the global framework adopted at CBD COP16 in 2024 to protect biodiversity?", a: "Kunming-Montreal Global Biodiversity Framework implementation", o: ["Kunming-Montreal Global Biodiversity Framework implementation", "Paris Biodiversity Accord", "Nairobi Protocol extension", "Singapore Nature Pledge"], d: "hard" },
    { q: "Which country launched its first domestically built aircraft carrier, INS Vikrant, and which year did it get commissioned?", a: "India, 2022", o: ["India, 2022", "India, 2023", "India, 2024", "India, 2021"], d: "hard" },
    { q: "Which AI safety treaty became the world's first legally binding international agreement on artificial intelligence in 2024?", a: "Council of Europe's Framework Convention on AI", o: ["Council of Europe's Framework Convention on AI", "UN AI Safety Charter", "G7 AI Governance Treaty", "OECD AI Binding Protocol"], d: "hard" },
  ],
 
  surprise: [
    // EASY (1-3)
    { q: "What is the most downloaded app globally in 2024?", a: "TikTok", o: ["TikTok", "Instagram", "YouTube", "WhatsApp"], d: "easy" },
    { q: "Which planet did NASA's Perseverance rover land on?", a: "Mars", o: ["Mars", "Venus", "Jupiter", "Saturn"], d: "easy" },
    { q: "What does 'GLP-1' refer to in the context of the biggest medical trend of 2024?", a: "A class of weight-loss and diabetes drugs like Ozempic", o: ["A class of weight-loss and diabetes drugs like Ozempic", "A new cancer treatment protein", "A gene-editing technique", "A heart surgery procedure"], d: "easy" },
 
    // MEDIUM (4-6)
    { q: "What is the name of SpaceX's massive rocket that completed its first successful flight in 2023?", a: "Starship", o: ["Starship", "Falcon Heavy", "New Glenn", "Vulcan"], d: "medium" },
    { q: "Which country became the first to legalise same-sex marriage in Asia in 2023?", a: "Taiwan", o: ["Taiwan", "Japan", "South Korea", "Thailand"], d: "medium" },
    { q: "What is 'vibe coding' — a term that went viral in the tech world in 2025?", a: "Writing code by describing intent to AI in natural language", o: ["Writing code by describing intent to AI in natural language", "Coding while listening to music for focus", "Using AI to review and debug code only", "Pair programming with an AI as your partner"], d: "medium" },
 
    // HARD (7-10)
    { q: "Which gene-editing tool won its creators the Nobel Prize in Chemistry in 2020 and has since enabled the first approved cure for sickle cell disease?", a: "CRISPR-Cas9", o: ["CRISPR-Cas9", "TALEN", "Zinc Finger Nuclease", "Base editing"], d: "hard" },
    { q: "What is 'perplexity' as a metric used to evaluate language models?", a: "A measure of how well a model predicts a sample — lower is better", o: ["A measure of how well a model predicts a sample — lower is better", "The number of errors per thousand tokens", "The model's confidence score on a benchmark", "The ratio of correct to incorrect completions"], d: "hard" },
    { q: "Which country became the first to introduce a central bank digital currency (CBDC) at full national scale?", a: "Nigeria (eNaira)", o: ["Nigeria (eNaira)", "China (Digital Yuan)", "Sweden (e-Krona)", "India (Digital Rupee)"], d: "hard" },
    { q: "In quantum computing, what does 'quantum supremacy' mean as demonstrated by Google in 2019?", a: "A quantum computer solved a problem no classical computer could solve in reasonable time", o: ["A quantum computer solved a problem no classical computer could solve in reasonable time", "A quantum computer ran faster than any supercomputer on all tasks", "A quantum computer operated at room temperature", "A quantum computer stored more data than any existing drive"], d: "hard" },
  ],
}

export async function POST(req: NextRequest) {
  try {
    const { category = 'surprise' } = await req.json()
    
    let questions = STORED_QUESTIONS[category] || STORED_QUESTIONS.surprise
    
    if (!questions || questions.length === 0) {
      questions = STORED_QUESTIONS.surprise
    }
    
    const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, 10).map((q, i) => ({
      question: q.q,
      options: q.o,
      answer: q.a,
      difficulty: q.d || (i < 3 ? 'easy' : i < 7 ? 'medium' : 'hard')
    }))
    
    return NextResponse.json({ questions: shuffled, source: 'stored' })
    
  } catch (error) {
    console.error('[Questions API] Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
