import { Link } from '@tanstack/react-router'
import { Github } from 'lucide-react'

import { ModeToggle } from '@/components/mode-toggle'
import { SearchCommand } from '@/components/search-command'
import { Button } from '@/components/ui/button'
import { GITHUB_OWNER } from '@/lib/github'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-muted/20 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="group flex shrink-0 items-center gap-1.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="font-display text-lg font-semibold tracking-[-0.025em]">
            hapwi&apos;s
          </span>
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground transition-colors group-hover:text-foreground">
            library
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <SearchCommand />
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="hidden sm:inline-flex"
          >
            <a
              href={`https://github.com/${GITHUB_OWNER}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Open GitHub profile"
            >
              <Github aria-hidden="true" />
            </a>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}
