import { Link, useRouterState } from '@tanstack/react-router'
import { Github } from 'lucide-react'

import { HapwiMark } from '@/components/hapwi-mark'
import { ModeToggle } from '@/components/mode-toggle'
import { SearchCommand } from '@/components/search-command'
import { Button } from '@/components/ui/button'
import { GITHUB_OWNER } from '@/lib/github'
import { cn } from '@/lib/utils'

export const primaryNav = [
  { to: '/', label: 'Work' },
  { to: '/repos', label: 'Repositories' },
  { to: '/discord-themes', label: 'Themes' },
  { to: '/tampermonkey', label: 'Scripts' },
] as const

export function isNavActive(pathname: string, to: string) {
  if (to === '/') return pathname === '/'
  return pathname === to || pathname.startsWith(`${to}/`)
}

export default function Header() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="site-container flex h-14 items-center gap-6">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="hapwi home"
        >
          <HapwiMark className="size-7" />
          <span className="font-display text-[1.05rem] font-semibold tracking-[-0.02em]">
            hapwi
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) => {
              const active = isNavActive(pathname, item.to)
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative inline-flex h-14 items-center px-3 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground',
                      active && 'text-foreground',
                    )}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute inset-x-3 bottom-0 h-0.5 rounded-t-full bg-brand transition-opacity',
                        active ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <SearchCommand />
          <Button asChild variant="ghost" size="icon">
            <a
              href={`https://github.com/${GITHUB_OWNER}`}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub profile"
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
