import { Link, useRouterState } from '@tanstack/react-router'
import { BookOpen, Github, Palette, ShieldCheck, GitBranch } from 'lucide-react'

import { ModeToggle } from '@/components/mode-toggle'
import { SearchCommand } from '@/components/search-command'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/', label: 'Library', icon: BookOpen },
  { path: '/discord-themes', label: 'Themes', icon: Palette },
  { path: '/tampermonkey', label: 'Scripts', icon: ShieldCheck },
  { path: '/bbpcn', label: 'BBPCN', icon: GitBranch },
]

export default function Header() {
  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-xl supports-backdrop-filter:bg-background/80">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center gap-2 sm:gap-6">
          {/* Logo - Editorial Typography */}
          <Link
            to="/"
            className="group flex items-center gap-2 sm:gap-3 transition-opacity hover:opacity-70 shrink-0"
            aria-label="hapwi home"
          >
            {/* Monogram mark */}
            <div className="flex size-8 sm:size-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
              <span className="font-display text-base sm:text-lg font-semibold tracking-tight">h</span>
            </div>
            <div className="hidden xs:flex flex-col">
              <span className="font-display text-base sm:text-lg font-semibold tracking-tight leading-none">
                hapwi
              </span>
              <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground">
                Code Library
              </span>
            </div>
          </Link>

          {/* Editorial Separator */}
          <div className="hidden h-8 w-px bg-border/50 lg:block" />

          {/* Navigation - Desktop */}
          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  'editorial-link group relative flex items-center gap-2 px-4 py-2 text-sm font-medium tracking-wide transition-colors',
                  isActive(path)
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className={cn(
                  'size-4 transition-colors',
                  isActive(path) ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground'
                )} />
                {label}
                {/* Active indicator - refined underline */}
                {isActive(path) && (
                  <span className="absolute inset-x-4 -bottom-[17px] h-[2px] bg-primary" />
                )}
              </Link>
            ))}
          </nav>

          {/* Mobile nav - icon only */}
          <nav className="flex items-center gap-0.5 lg:hidden ml-auto">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex items-center justify-center rounded-md p-2 transition-colors',
                  isActive(path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                aria-label={label}
              >
                <Icon className="size-4" />
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-1 sm:gap-2 lg:ml-auto">
            <SearchCommand />

            <div className="hidden h-5 w-px bg-border/40 sm:block" />

            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden sm:flex h-9 gap-2 px-3 text-muted-foreground hover:text-foreground"
            >
              <a
                href="https://github.com/hapwi"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub profile"
              >
                <Github className="size-4" />
                <span className="hidden md:inline text-sm font-medium">GitHub</span>
              </a>
            </Button>

            <ModeToggle />
          </div>
        </div>
      </div>

      {/* Bottom border accent */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </header>
  )
}
