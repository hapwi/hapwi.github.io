import { Link } from '@tanstack/react-router'
import { Github } from 'lucide-react'

import { ModeToggle } from '@/components/mode-toggle'
import { SearchCommand } from '@/components/search-command'
import { Button } from '@/components/ui/button'
import { GITHUB_OWNER } from '@/lib/github'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:h-[4.5rem] lg:px-8">
        <Link
          to="/"
          className="group flex shrink-0 items-baseline gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="font-display text-lg font-semibold tracking-tight">
            hapwi
          </span>
          <span className="hidden font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors group-hover:text-foreground sm:inline">
            library
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <SearchCommand />
          <Button
            asChild
            variant="ghost"
            size="icon-lg"
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
