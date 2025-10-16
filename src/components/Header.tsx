import { Link } from '@tanstack/react-router'
import { Github } from 'lucide-react'

import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <SidebarTrigger className="-ml-1" />
      <Link
        to="/"
        className="text-lg font-semibold tracking-tight"
        aria-label="hapwi home"
      >
        hapwi
      </Link>
      <div className="ml-auto flex items-center gap-2">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="sm:hidden"
        >
          <a
            href="https://github.com/hapwi"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub profile"
          >
            <Github className="size-4" />
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="hidden sm:inline-flex"
        >
          <a
            href="https://github.com/hapwi"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub profile"
          >
            <Github className="size-4" />
            <span className="ml-2">GitHub</span>
          </a>
        </Button>
        <ModeToggle />
      </div>
    </header>
  )
}
