'use client'

interface FooterProps {
  playerName?: string
}

export function Footer({ playerName }: FooterProps) {
  return (
    <footer className="absolute bottom-2 left-6 right-6 flex max-sm:flex-col justify-between items-center px-4 py-2" style={{ borderColor: 'hsl(0, 0%, 12%)' }}>
      <div className="flex items-center gap-2 uppercase tracking-[0.15em]">
        <span className="text-xs font-mono text-muted-foreground/70">HOTSEAT</span>
        <span className="text-muted-foreground/30">|</span>
        <span className="text-xs font-mono text-muted-foreground/50 space-x-1">
        <span>Powered by</span>
      <a
        href="https://elevenlabs.io"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground/70 hover:text-muted-foreground/95 transition-colors duration-200"
      >
        ElevenLabs
      </a>
      <span className="text-muted-foreground/40">&</span>
      <a
        href="https://firecrawl.dev"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground/70 hover:text-muted-foreground/95 transition-colors duration-200"
      >
        Firecrawl
      </a>
        </span>
      </div>
      <div className="flex items-center gap-2 uppercase tracking-[0.15em]">
        <a 
          href="https://aunn.space"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-muted-foreground/70 hover:text-muted-foreground/95 transition-colors duration-200">
            Anjul Bhatia
          </a>
        <span className="text-muted-foreground/30">|</span>
        <a 
          href="https://hacks.elevenlabs.io/hackathons/0"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-muted-foreground/70 hover:text-muted-foreground/95 transition-colors duration-200">Vote</a>
      </div>
    </footer>
  )
}
